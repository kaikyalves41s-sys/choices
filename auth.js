// Conta do site: botão na gaveta do menu + janela de login (e-mail e senha).
// Aparece sozinha ao abrir a página inicial (ou um link de sala) sem estar logado.
const choicesAuth = (() => {
  const base = 'https://www.gstatic.com/firebasejs/11.10.0/';
  const MSG = {
    'auth/invalid-credential':'E-mail ou senha incorretos.',
    'auth/wrong-password':'E-mail ou senha incorretos.',
    'auth/user-not-found':'E-mail ou senha incorretos.',
    'auth/email-already-in-use':'Já existe uma conta com esse e-mail. Use “Entrar”.',
    'auth/weak-password':'Senha fraca: use pelo menos 6 caracteres.',
    'auth/invalid-email':'E-mail inválido.',
    'auth/missing-email':'Informe o e-mail.',
    'auth/operation-not-allowed':'Esse método de login ainda não foi ativado no Firebase (Authentication › Método de login).',
    'auth/unauthorized-domain':'Este endereço do site não está autorizado no Firebase (Authentication › Configurações › Domínios autorizados).',
    'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente de novo.',
    'auth/network-request-failed':'Sem conexão. Verifique a internet.',
    'auth/web-storage-unsupported':'O navegador está bloqueando cookies/armazenamento. Libere e tente de novo.',
    'auth/internal-error':'Erro interno do login. Confira se o login por e-mail/senha está ativado no Firebase e se o domínio está autorizado.',
    'auth/invalid-api-key':'A chave do Firebase em firebase-config.js é inválida.',
    'auth/api-key-not-valid':'A chave do Firebase em firebase-config.js é inválida.'
  };
  const safe = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const $id = id => document.getElementById(id);
  let mod, session, user = null, busy = false;

  const label = () => (user?.displayName || user?.email?.split('@')[0] || 'Jogador').slice(0, 14);

  const nav = document.querySelector('.nav');
  const acct = document.createElement('div');
  acct.id = 'acct';
  if (nav) nav.insertBefore(acct, $id('th'));

  // Aviso fixo no canto: mostra quem está logado sem precisar abrir o menu.
  const chip = document.createElement('button');
  chip.id = 'acct-chip';
  chip.type = 'button';
  chip.dataset.a = 'in';
  document.body.appendChild(chip);

  function toast(text) {
    const box = document.createElement('div');
    box.className = 'toast';
    box.setAttribute('role', 'status');
    box.textContent = text;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
  }

  const dlg = document.createElement('dialog');
  dlg.id = 'login-dlg';
  dlg.setAttribute('aria-labelledby', 'login-title');
  dlg.innerHTML = `<form id="login-form">
    <h2 id="login-title">Entrar no CHOICES</h2>
    <p class="rules">Com uma conta (e-mail e senha) você cria salas e joga online com outros usuários. O modo local não precisa de login.</p>
    <label>E-mail <input id="login-email" type="email" autocomplete="email" required></label>
    <label>Senha <input id="login-pass" type="password" minlength="6" autocomplete="current-password" required></label>
    <label>Apelido (usado ao criar a conta) <input id="login-name" maxlength="14" autocomplete="nickname"></label>
    <p><button class="btn" type="submit">Entrar</button>
    <button class="btn alt" type="button" data-a="signup">Criar conta</button></p>
    <p><button class="btn alt" type="button" data-a="reset">Esqueci a senha</button></p>
    <p role="status" id="login-status"></p>
    <p><button class="btn alt" type="button" data-a="close">Agora não, só jogar local</button></p>
  </form>`;
  document.body.appendChild(dlg);

  const status = text => { $id('login-status').textContent = text || ''; };
  const field = id => $id(id).value.trim();

  function paint() {
    acct.innerHTML = user
      ? `<span class="acct-name">👤 ${safe(label())}</span><button class="btn alt" type="button" data-a="out">Sair da conta</button>`
      : `<button class="btn" type="button" data-a="in">Entrar / Criar conta</button>`;
    chip.textContent = user ? '👤 ' + label() : 'Entrar';
    chip.classList.toggle('on', !!user);
    chip.dataset.a = user ? '' : 'in';
    chip.disabled = !!user;
  }
  function changed() {
    paint();
    window.dispatchEvent(new CustomEvent('choices-auth', {detail: user}));
  }
  function open(message) {
    status(message);
    document.body.classList.remove('menu-open');
    if (!dlg.open) dlg.showModal();
    $id('login-email').focus();
  }

  async function guard(task) {
    if (busy) return;
    busy = true;
    dlg.classList.add('busy');
    try { await task(); }
    catch (error) { status(MSG[error.code] || (error.code ? 'Não foi possível concluir (' + error.code + ').' : error.message)); }
    finally { busy = false; dlg.classList.remove('busy'); }
  }
  const done = u => { user = u; $id('login-form').reset(); status(''); dlg.close(); changed(); toast('Você entrou como ' + label() + '.'); };

  const signIn = () => guard(async () => {
    await ready;
    const email = field('login-email'), pass = $id('login-pass').value;
    if (!email || !pass) throw Error('Informe e-mail e senha.');
    done((await mod.signInWithEmailAndPassword(session, email, pass)).user);
  });
  const signUp = () => guard(async () => {
    await ready;
    const email = field('login-email'), pass = $id('login-pass').value;
    if (!email || !pass) throw Error('Informe e-mail e senha para criar a conta.');
    if (pass.length < 6) throw Error('A senha precisa ter pelo menos 6 caracteres.');
    const created = await mod.createUserWithEmailAndPassword(session, email, pass);
    await mod.updateProfile(created.user, {displayName: (field('login-name') || email.split('@')[0]).slice(0, 14)});
    done(created.user);
  });
  const reset = () => guard(async () => {
    await ready;
    const email = field('login-email');
    if (!email) throw Error('Digite seu e-mail e toque em “Esqueci a senha”.');
    await mod.sendPasswordResetEmail(session, email);
    status('Enviamos um link para redefinir a senha (veja também o spam).');
  });
  const signOut = () => guard(async () => {
    await ready;
    await mod.signOut(session);
    user = null;
    changed();
    toast('Você saiu da conta.');
  });

  document.addEventListener('click', event => {
    const action = event.target.closest('[data-a]')?.dataset.a;
    if (!action) return;
    if (action === 'in') open();
    if (action === 'out') signOut();
    if (action === 'signup') signUp();
    if (action === 'reset') reset();
    if (action === 'close') dlg.close();
  });
  $id('login-form').addEventListener('submit', event => { event.preventDefault(); signIn(); });
  dlg.addEventListener('click', event => { if (event.target === dlg) dlg.close(); });

  const ready = (async () => {
    const {firebaseConfig} = await import('./firebase-config.js');
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) throw Error('Configure os dados do aplicativo Web em firebase-config.js.');
    const [app, auth] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js')]);
    const instance = app.getApps()[0] || app.initializeApp(firebaseConfig);
    mod = auth;
    session = auth.getAuth(instance);
    await session.authStateReady();
    if (session.currentUser?.isAnonymous) await auth.signOut(session);
    user = session.currentUser;
    auth.onAuthStateChanged(session, next => {
      if (next?.isAnonymous || next?.uid === user?.uid) return;
      user = next;
      if (user && dlg.open) dlg.close();
      changed();
    });
    paint();
    const invite = new URL(location.href).searchParams.has('sala');
    const home = /(^|\/)(index\.html)?$/.test(location.pathname);
    let asked = false;
    try { asked = sessionStorage.getItem('choices-login-asked') === '1'; } catch {}
    if (!user && (invite || (home && !asked))) {
      try { sessionStorage.setItem('choices-login-asked', '1'); } catch {}
      open(invite ? 'Entre na sua conta para acessar a sala do convite.' : '');
    }
    return user;
  })();
  ready.catch(() => { acct.innerHTML = ''; });
  paint();

  return {ready, get user() { return user; }, open, signOut};
})();
