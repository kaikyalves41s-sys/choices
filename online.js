const choicesOnline = (() => {
  const panel = $('online');
  const original = {start, begin, pick, play, bonus, skip, nxt, nr};
  let api, uid, room, ref, unsubscribe, pending = false, simulating = false;
  let user = null, ready = false;
  const setUser = u => { user = u; uid = u ? u.uid : null; };
  const nick = () => safe((user?.displayName || user?.email?.split('@')[0] || '').slice(0,14));
  let generation = 0;
  const renderGame = render;
  render = () => { if (!simulating) renderGame(); };

  const invite = new URL(location.href).searchParams.get('sala') || '';
  const validCode = code => /^[A-F0-9]{16}$/.test(code);
  const safe = value => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[c]);
  const actor = data => data.members[data.actorIndex];
  const canAct = () => !!room && actor(room) === uid;
  const actorName = () => safe(room?.names[room.actorIndex] || 'outro jogador');

  function show(message = '') {
    if (!ref) {
      if (!ready) {
        panel.innerHTML = `<h2>Partida online</h2><p role="status" id="online-status">${safe(message || 'Carregando…')}</p>`;
        return;
      }
      if (!user) {
        panel.innerHTML = `<h2>Entrar para jogar online</h2>
          <p class="rules">Entre com a sua conta para criar salas e jogar com outros usuários. O modo local continua sem login.</p>
          <form data-online-form>
          <label>E-mail <input id="login-email" type="email" autocomplete="email" required></label>
          <label>Senha <input id="login-pass" type="password" minlength="6" autocomplete="current-password" required></label>
          <label>Apelido (usado ao criar a conta) <input id="login-name" maxlength="14" autocomplete="nickname"></label>
          <p><button class="btn" type="submit">Entrar</button>
          <button class="btn alt" type="button" data-online="signup">Criar conta</button></p>
          <p><button class="btn alt" type="button" data-online="google">Entrar com Google</button>
          <button class="btn alt" type="button" data-online="reset">Esqueci a senha</button></p></form>
          <p role="status" id="online-status">${safe(message || (invite ? 'Entre na sua conta para acessar a sala do convite.' : ''))}</p>`;
        return;
      }
      panel.innerHTML = `<h2>Partida online</h2>
        <p>Conectado como <b>${nick()}</b> <button class="btn alt" data-online="logout">Sair da conta</button></p>
        <label>Seu apelido nesta sala <input id="online-name" maxlength="14" value="${nick()}" autocomplete="off"></label>
        <label>Código da sala <input id="online-code" maxlength="16" value="${validCode(invite) ? invite : ''}" autocomplete="off"></label>
        <p><button class="btn" data-online="create">Criar sala</button>
        <button class="btn alt" data-online="join">Entrar na sala</button></p>
        <p role="status" id="online-status">${safe(message)}</p>`;
      return;
    }
    panel.innerHTML = `<h2>Sala ${ref.id}</h2>
      <p>${room ? room.names.map(safe).join(' · ') + ' (' + room.members.length + '/4)' : 'Carregando…'}</p>
      <p><button class="btn alt" data-online="copy">Copiar convite</button>
      ${room && !room.state && room.host === uid && room.members.length >= 2 ?
        '<button class="btn" data-online="start">Começar partida online</button>' : ''}
      <button class="btn alt" data-online="leave">Voltar ao modo local</button></p>
      <p role="status" id="online-status">${safe(message || (room && !room.state ?
        (room.members.length < 2 ? 'Convide pelo menos mais um jogador.' : 'O anfitrião pode iniciar a partida.') : ''))}</p>`;
  }

  function status(message) {
    const element = $('online-status');
    if (element) element.textContent = message;
  }

  async function connect() {
    if (api) return;
    const {firebaseConfig} = await import('./firebase-config.js');
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw Error('Configure os dados do aplicativo Web em firebase-config.js.');
    }
    const base = 'https://www.gstatic.com/firebasejs/11.10.0/';
    const [app, auth, db] = await Promise.all([
      import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
    ]);
    const instance = app.getApps()[0] || app.initializeApp(firebaseConfig);
    const session = auth.getAuth(instance);
    await session.authStateReady();
    api = {...db, store: db.getFirestore(instance), auth, session};
    if (session.currentUser?.isAnonymous) await auth.signOut(session);
    setUser(session.currentUser);
  }

  function decode(data) {
    const state = JSON.parse(data.state);
    const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
    const card = value => integer(value,0,EV.length-1);
    if (state.n !== data.names.length || !Array.isArray(state.pl) || state.pl.length !== state.n ||
        !integer(state.round,0,Number.MAX_SAFE_INTEGER) || !integer(state.pos,0,state.n) ||
        !['prep','turn','result','sum','end'].includes(state.ph) ||
        !TK.includes(state.trend) || (state.color !== null && !TK.includes(state.color)) ||
        !Array.isArray(state.deck) || !state.deck.every(card) ||
        !Array.isArray(state.disc) || !state.disc.every(card) ||
        !Array.isArray(state.rl) || !state.rl.every(entry => Array.isArray(entry) && entry.length === 3 &&
          integer(entry[0],0,state.n-1) && integer(entry[1],0,3) && integer(entry[2],-10,10)) ||
        (state.ph === 'sum' && (!Array.isArray(state.eq) || !state.eq.every(entry =>
          Array.isArray(entry) && integer(entry[0],0,state.n-1) && integer(entry[1],0,3)))) ||
        (state.ph === 'end' && !integer(state.win,0,state.n-1)) ||
        (state.ph === 'result' && !card(state.card))) throw Error('Estado da partida inválido.');
    state.pl.forEach((player,i) => {
      if (!Array.isArray(player.v) || player.v.length !== 4 || !player.v.every(v => integer(v,0,10)) ||
          !Array.isArray(player.hand) || !player.hand.every(card) ||
          !Array.isArray(player.used) || !player.cnt || !TK.every(k => integer(player.cnt[k],0,Number.MAX_SAFE_INTEGER))) {
        throw Error('Dados de jogador inválidos.');
      }
      player.name = safe(data.names[i]);
    });
    // Exiba somente texto nas linhas de resultado recebidas de outro aparelho.
    state.log = Array.isArray(state.log) ? state.log.map(line => '<li>' +
      safe(String(line).replace(/<[^>]*>/g,'').slice(0,180)) + '</li>') : [];
    state.online = true;
    return state;
  }

  function watch(target) {
    const currentGeneration = ++generation;
    unsubscribe?.();
    ref = target;
    S = null;
    showHand();
    show();
    $('panel').textContent = 'Aguardando a sala online…';
    unsubscribe = api.onSnapshot(target, snapshot => {
      if (generation !== currentGeneration || !snapshot.exists()) return;
      room = snapshot.data();
      M = room.duration;
      try { S = room.state ? decode(room) : null; }
      catch { status('Os dados da partida estão inválidos.'); return; }
      if (S) render();
      else {
        $('board').innerHTML = boardSVG() + score();
        $('panel').textContent = 'Aguardando o início da partida online.';
      }
      show();
    }, () => status('A conexão com a sala foi interrompida. Recarregue para reconectar.'));
    const url = new URL(location.href);
    url.searchParams.set('sala', target.id);
    url.hash = 'jogar';
    history.replaceState(null, '', url);
  }

  async function enter(create) {
    const name = $('online-name').value.trim().slice(0,14) || 'Jogador';
    const code = create
      ? Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2,'0')).join('').toUpperCase()
      : $('online-code').value.trim().toUpperCase();
    const duration = M;
    if (!validCode(code)) throw Error('Informe o código de 16 caracteres do convite.');
    await connect();
    if (!uid) throw Error('Entre na sua conta primeiro.');
    const target = api.doc(api.store,'choicesRooms',code);
    await api.runTransaction(api.store, async tx => {
      const snapshot = await tx.get(target);
      if (create) {
        if (snapshot.exists()) throw Error('Já existe uma sala com esse código. Crie outra.');
        tx.set(target,{host:uid,members:[uid],names:[name],duration,state:'',revision:0,actorIndex:0});
        return;
      }
      if (!snapshot.exists()) throw Error('Sala não encontrada.');
      const data = snapshot.data();
      if (data.members.includes(uid)) return;
      if (data.state || data.members.length >= 4) throw Error('A sala está cheia ou a partida já começou.');
      tx.update(target,{members:[...data.members,uid],names:[...data.names,name]});
    });
    watch(target);
  }

  function simulate(previous, duration, action, args, names) {
    const saved = {S,M};
    simulating = true;
    try {
      S = previous;
      M = duration;
      original[action](...(names ? [names.map(safe)] : args));
      S.online = true;
      return {state:JSON.stringify(S),actorIndex:['prep','sum','end'].includes(S.ph) ? 0 : cur()};
    } finally {
      S = saved.S;
      M = saved.M;
      simulating = false;
    }
  }

  function allowed(action, args, state) {
    if (action === 'begin') return state.ph === 'prep';
    if (action === 'nr') return state.ph === 'sum';
    if (action === 'nxt') return state.ph === 'result';
    if (state.ph !== 'turn') return false;
    const player = state.pl[cur()];
    if (action === 'bonus') return state.pend && Number.isInteger(args[0]) && player.v[args[0]] < M;
    if (state.pend) return false;
    if (action === 'pick') return state.pos === 0 && !state.color && TK.includes(args[0]);
    if (action === 'play') return !!state.color && EV[player.hand[args[0]]]?.c === state.color;
    return action === 'skip' && !!state.color && !player.hand.some(card => EV[card].c === state.color);
  }

  async function move(action, args = []) {
    if (!room || !canAct()) return;
    const target = ref;
    const expected = room.revision;
    await api.runTransaction(api.store, async tx => {
      const data = (await tx.get(target)).data();
      if (!data || data.revision !== expected || actor(data) !== uid) {
        throw Error('A partida mudou. Tente novamente na sua vez.');
      }
      if (action === 'start') {
        if (data.host !== uid || data.state || data.members.length < 2) return;
        tx.update(target,{...simulate(null,data.duration,'start',[],data.names),revision:expected+1});
      } else {
        const state = decode(data);
        if (!allowed(action,args,state)) throw Error('Essa ação não está disponível nesta etapa.');
        tx.update(target,{...simulate(state,data.duration,action,args),revision:expected+1});
      }
    });
  }

  const AUTH_MSG = {
    'auth/invalid-credential':'E-mail ou senha incorretos.',
    'auth/wrong-password':'E-mail ou senha incorretos.',
    'auth/user-not-found':'E-mail ou senha incorretos.',
    'auth/email-already-in-use':'Já existe uma conta com esse e-mail. Use “Entrar”.',
    'auth/weak-password':'Senha fraca: use pelo menos 6 caracteres.',
    'auth/invalid-email':'E-mail inválido.',
    'auth/missing-email':'Informe o e-mail.',
    'auth/popup-closed-by-user':'Login com Google cancelado.',
    'auth/cancelled-popup-request':'Login com Google cancelado.',
    'auth/popup-blocked':'O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.',
    'auth/operation-not-allowed':'Esse método de login ainda não foi ativado no Firebase (Authentication › Método de login).',
    'auth/unauthorized-domain':'Este endereço do site não está autorizado no Firebase (Authentication › Configurações › Domínios autorizados).',
    'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente de novo.',
    'auth/network-request-failed':'Sem conexão. Verifique a internet.'
  };
  const field = id => $(id)?.value.trim() || '';

  async function loggedIn(u) {
    setUser(u);
    show();
    await resume();
  }

  async function signIn() {
    await connect();
    const email = field('login-email'), pass = $('login-pass')?.value || '';
    if (!email || !pass) throw Error('Informe e-mail e senha.');
    await loggedIn((await api.auth.signInWithEmailAndPassword(api.session, email, pass)).user);
  }

  async function signUp() {
    await connect();
    const email = field('login-email'), pass = $('login-pass')?.value || '';
    if (!email || !pass) throw Error('Informe e-mail e senha para criar a conta.');
    if (pass.length < 6) throw Error('A senha precisa ter pelo menos 6 caracteres.');
    const created = await api.auth.createUserWithEmailAndPassword(api.session, email, pass);
    await api.auth.updateProfile(created.user, {displayName: (field('login-name') || email.split('@')[0]).slice(0,14)});
    await loggedIn(created.user);
  }

  async function google() {
    await connect();
    await loggedIn((await api.auth.signInWithPopup(api.session, new api.auth.GoogleAuthProvider())).user);
  }

  async function reset() {
    await connect();
    const email = field('login-email');
    if (!email) throw Error('Digite seu e-mail e toque em “Esqueci a senha”.');
    await api.auth.sendPasswordResetEmail(api.session, email);
    status('Enviamos um link para redefinir a senha (veja também o spam).');
  }

  async function logout() {
    await api.auth.signOut(api.session);
    setUser(null);
    show();
  }

  async function resume() {
    if (!validCode(invite) || !uid || ref) return;
    const target = api.doc(api.store,'choicesRooms',invite);
    const snapshot = await api.getDoc(target);
    if (snapshot.exists() && snapshot.data().members.includes(uid)) watch(target);
  }

  async function run(task) {
    if (pending) return;
    pending = true;
    try { await task(); }
    catch (error) {
      status(error.code === 'permission-denied' ? 'Acesso negado. Confira o código e se a sala ainda aceita jogadores.' :
        AUTH_MSG[error.code] || (error.code ? 'O Firebase não concluiu a operação (' + error.code + ').' : error.message));
    } finally { pending = false; }
  }

  for (const action of Object.keys(original)) {
    if (action === 'start') continue;
    window[action] = (...args) => ref ? run(() => move(action,args)) : original[action](...args);
  }

  function leave() {
    ++generation;
    unsubscribe?.();
    ref = room = unsubscribe = null;
    S = null;
    const url = new URL(location.href);
    url.searchParams.delete('sala');
    history.replaceState(null,'',url);
    show();
    render();
  }

  panel.addEventListener('click', event => {
    const action = event.target.closest('[data-online]')?.dataset.online;
    if (action === 'create' || action === 'join') run(() => enter(action === 'create'));
    if (action === 'start') run(() => move('start'));
    if (action === 'signup') run(signUp);
    if (action === 'google') run(google);
    if (action === 'reset') run(reset);
    if (action === 'logout' && !pending) run(logout);
    if (action === 'leave' && !pending) leave();
    if (action === 'copy') run(async () => {
      await navigator.clipboard.writeText(location.href);
      status('Convite copiado.');
    });
  });
  panel.addEventListener('submit', event => {
    if (!event.target.matches('[data-online-form]')) return;
    event.preventDefault();
    run(signIn);
  });
  show();
  run(async () => {
    await connect();
    ready = true;
    show();
    await resume();
  });
  const playerIndex = () => room?.members.indexOf(uid) ?? -1;
  return {canAct, actorName, playerIndex, leave};
})();
