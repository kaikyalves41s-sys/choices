let M=8;const TN=['Trabalho','Estudo','Bem-estar','Vida pessoal'],TK=['T','E','B','V'],TC={T:'#1f5fbf',E:'#f2b705',B:'#12a150',V:'#c21f1f'},CN={T:'Azul',E:'Amarelo',B:'Verde',V:'Vermelho'},PC=['E','T','V','B'],QA=[0,270,180,90];
const ST=[['B',[1,1,3,1]],['B',[1,0,4,2]],['B',[1,1,3,2]],['E',[2,3,1,1]],['E',[1,3,2,1]],['E',[2,4,0,1]],['V',[1,1,2,3]],['V',[1,1,1,3]],['T',[3,1,2,1]],['T',[3,2,1,1]],['T',[4,2,1,0]],['V',[0,1,2,4]]];
const EV=`Organização|E|E3,B1
Exercícios|B|B3,V1
Relatório|T|T3,B-1
Jogos|V|V2,E-1
Boas notas|E|E3,T2
Fast food|B|B-2,T-1
Desordem|T|T-2,B-2
Família|V|V3,B2
Alimentação|B|B3,V2
Saúde física|B|B3|any:Alimentação/Exercícios
Saúde mental|B|B2,T2,E2
Procrastinação|E|E-2,T-1
Insônia|E|E-2,B-2
Reprovação|E|E-3,V-2
Recuperação|E|E-2,V-1
Desorganização|E|E-3,B-2
Nomofobia|B|B-3,E-1
Bom sono|B|B2,V1
Alcoolismo|B|B-2,V-1
Fumo|B|B-2,V-1
Estresse|B|B-2,T-1
Ansiedade|B|B-2,E-1,T-1
Paciência|B|B2,T2
Bullying|E|E-2,V-2
Dívidas|V|V-3,B-2
Ostentação|V|V2,B-1
Gravidez|V|V3,E-2
Relacionamento|V|V3|pen:Gravidez
Desqualificação|T|T-2,E-1
Aprendiz|T|T1,E1
Demissão|T|T-2,B-1
Promoção|T|T2,B1
Casa nova|V|V3,B2
Casamento|V|V4,E-2
Preguiça|V|V-2,T-1
Amizade|V|V2,B1
Caos|T|T-2,B-1
Incompetência|T|T-2,B-1
Diretoria|T|T2,V1
Qualificação|T|T3,E2
Impontualidade|T|T-3,E-2
Chefe|T|T3|any:Aprendiz/Diretoria
Econômico|V|V3|any:Casa nova
Internet|V|T-2,B-1
Vestibular|E|E2,V1
Perspectiva|E|E2,V1
Metas|E|E2,V1
Faculdade|E|E3|any:Boas notas/Vestibular
Mentoria|T|T2,E1
Burnout|T|T-3,B-2
Networking|T|T2,V1
Leitura|E|E2,B1
Distração|E|E-2,T-1
Curso online|E|E3,B-1
Meditação|B|B3,E1
Sedentarismo|B|B-2,T-1
Caminhada|B|B2,V1
Voluntariado|V|V3,B1
Briga|V|V-3,B-1
Viagem|V|V3,T-1`.split('\n').map(l=>{const[n,c,e,x]=l.split('|'),ef=e.split(',').map(s=>[s[0],+s.slice(1)]);let any=null,pen=null;if(x){const[k,v]=x.split(':');if(k=='any')any=v.split('/');else pen=v}return{n,c,ef,any,pen}});
const ki=k=>TK.indexOf(k),$=id=>document.getElementById(id);
const ART_DIR='img/',ART_EXT='png';
// Texto de cada carta, igual ao da carta original (um item por parágrafo).
// Cartas que não estão aqui mostram só a pontuação ("Suba 3 casas em estudo.").
const TXT={
"Organização":["Foi organizado com seus estudos, suba 3 casas em estudo.", "Sobrou tempo para se divertir, suba 1 casa em bem-estar."],
"Exercícios":["Praticou exercícios físicos, suba 3 casas em bem-estar.", "Aumentou sua autoestima, suba 1 casa em vida pessoal."],
"Jogos":["Gastou tempo jogando, suba 2 casas em vida pessoal.", "Poderia estar estudando para prova, volte 1 casa em estudo."],
"Relatório":["Entregou os relatórios antes do prazo, suba 3 casas em trabalho.", "Mas perdeu muitas horas de sono, volte 1 casa em bem-estar."],
"Boas notas":["Tirou boas notas, suba 3 casas em estudo.", "Futuramente, vai ser um bom profissional, suba 2 casas em trabalho."],
"Fast food":["Não comeu comida saudável, volte 2 casas em bem-estar.", "Ficou doente e faltou o trabalho, volte 1 casa em trabalho."],
"Desordem":["Atrasou todo seu trabalho, volte 2 casas em trabalho.", "Aumentou seu estresse, volte 2 casas em bem-estar."],
"Família":["Momentos em família, suba 3 casas em vida pessoal.", "Diminuiu seu estresse, suba 2 casas em bem-estar."],
"Alimentação":["Uma alimentação saudável é essencial, suba 3 casas em bem-estar.", "Isso diminuiu seus problemas de saúde, suba 2 casas em vida pessoal."],
"Saúde física":["Parabéns por ter uma boa saúde, suba 3 casas em bem-estar.", "Se antes você usou a carta alimentação ou exercício, suba 2 casas em qualquer caminho."],
"Saúde mental":["O controle dos seus pensamentos é essencial, suba 2 casas em bem-estar.", "Uma mente centrada ajuda bastante, suba 2 casas em trabalho e estudos."],
"Procrastinação":["Não cumpriu suas obrigações, volte 2 casas em estudo.", "Irresponsabilidade faz de você um profissional ruim, volte 1 casa em trabalho."],
"Insônia":["Perdeu aula por dormir tarde, volte 2 casas em estudo.", "Sono desregulado, volte 2 casas em bem-estar."],
"Reprovação":["Não estudou e foi reprovado, volte 3 casas em estudo.", "Isso trouxe problemas para sua vida, volte 2 casas em vida pessoal."],
"Recuperação":["Esforce-se mais para não ficar de recuperação, volte 2 casas em estudo.", "Seus pais não estão contentes com suas notas, volte 1 casa em vida pessoal."],
"Desorganização":["Faltou entregar suas atividades e projetos, volte 3 casas em estudo.", "Desorganização faz você voltar 2 casas em bem-estar."],
"Nomofobia":["Uso excessivo da tecnologia, volte 3 casas em bem-estar.", "Perdeu rendimento na escola por reação da nomofobia, volte 1 casa em estudos."],
"Bom sono":["Qualidade de sono faz você subir 2 casas em qualidade de vida.", "Melhorou seu controle de tempo, suba uma casa em vida pessoal."],
"Alcoolismo":["Bebeu demais ao longo da vida, volte 2 casas em bem-estar.", "Problemas pessoais foram surgindo devido a bebida, volte 1 casa em vida pessoal."],
"Fumo":["Prejudicou seu pulmão, volte 2 casas em bem-estar.", "Isso pode prejudicar mais a longo prazo, volte 1 casa em vida pessoal."],
"Estresse":["Causou uma perda no rendimento, volte 2 casas em bem-estar.", "Problemas no emprego, volte 1 casa em trabalho."],
"Ansiedade":["Você está muito ansioso, volte 2 casas em bem-estar.", "Está muito ansioso ao fazer provas, volte 1 casa em estudo e trabalho."],
"Paciência":["Aprendeu a controlar suas emoções, suba 2 casas em bem-estar.", "Melhorou seus relacionamentos na empresa, suba 2 casas em trabalho."],
"Bullying":["Tomou advertência na escola, volte 2 casas em estudo.", "Fazendo bullying, volte 2 casas em vida pessoal."],
"Dívidas":["Você gastou mais do que tinha, volte 3 casas em vida pessoal.", "Ter dívidas não é bom, volte 2 casas em bem-estar."],
"Ostentação":["Você gastou demais, suba 2 casas em vida pessoal.", "Gastar demais não é bom, volte 1 casa em bem-estar."],
"Gravidez":["Você vai ter um bebê, suba 3 casas em vida pessoal.", "Por conta do bebê, volte 2 casas em estudo."],
"Relacionamento":["Você está namorando, suba 3 casas em vida pessoal.", "Se você já tiver engravidado, volte 4 casas em vida pessoal."],
"Desqualificação":["Currículo pobre, você não foi aceito, volte 2 casas em trabalho.", "Não se interessou em se qualificar na escola, volte 1 casa em estudo."],
"Aprendiz":["Tornou-se aprendiz para aumentar seu conhecimento, suba 1 casa em trabalho.", "Como reação do seu esforço, suba 1 casa em estudo."],
"Demissão":["Não cumpriu suas tarefas, volte 2 casas em trabalho.", "Perdeu estabilidade financeira, volte uma casa em bem-estar."],
"Promoção":["Fez com excelência seu trabalho e foi promovido, suba 2 casas em trabalho.", "Suba 1 casa em bem-estar por ser esforçado."],
"Casa nova":["Você comprou uma casa, suba 3 casas em vida pessoal.", "Com a casa nova, você tem mais espaço para aproveitar, suba 2 casas em bem-estar."],
"Casamento":["Parabéns por se casar, suba 4 casas em vida pessoal.", "Você agora não estuda mais, desça 2 casas em estudo."],
"Preguiça":["Você é preguiçoso, volte 2 casas em vida pessoal.", "Por ser preguiçoso, você foi demitido, volte 1 casa em trabalho."],
"Amizade":["Parabéns por ter boas amizades, suba 2 casas em vida pessoal.", "Ter amigos é importante, suba 1 casa em bem-estar."],
"Caos":["Não se organizou e perdeu o horário, volte 2 casas em trabalho.", "Volte 1 casa em qualidade de vida por reação da sua escolha."],
"Incompetência":["Não trabalhou bem, volte 2 casas em trabalho.", "Falta de atenção, isso gerou problemas em todos os aspectos, volte 1 casa em bem-estar."],
"Diretoria":["Você virou diretor na sua empresa, suba 2 casas em trabalho.", "Suba 1 casa em vida pessoal por esse novo marco."],
"Qualificação":["Você tem um currículo impecável, foi aceito no seu primeiro emprego, suba 3 casas em trabalho.", "Parabéns por ter estudado bastante, suba 2 casas em estudo."],
"Impontualidade":["Causa a volta de 3 casas em trabalho por perder a reunião.", "Causa a volta de 2 casas em estudo por não entregar as atividades."],
"Chefe":["Suba 3 casas em trabalho, parabéns pela sua carreira de sucesso.", "Se você usou a carta aprendiz ou diretor antes, suba 2 casas em qualquer caminho."],
"Econômico":["Guardou dinheiro, suba 3 casas em vida pessoal.", "Se você usou antes a carta casa nova, suba 2 casas em qualquer caminho."],
"Internet":["Passou muito tempo na internet e se atrasou, volte 2 casas em trabalho.", "Isso gerou dor de cabeça, volte 1 casa em bem-estar."],
"Vestibular":["Parabéns, o homem é o que a educação faz dele, suba 2 casas em estudo.", "Passou no vestibular, isso é novo marco na sua vida, suba 1 casa em vida pessoal."],
"Perspectiva":["Tudo é questão de perspectiva, escolha o melhor ângulo, suba 2 casas em estudo.", "Você adquiriu uma perspectiva de vida, suba 1 casa em vida pessoal."],
"Metas":["Você estipulou metas, suba 2 casas em estudo.", "Tudo tem seu tempo, um passo de cada vez, suba 1 casa em vida pessoal."],
"Faculdade":["Parabéns, um novo ciclo se inicia, suba 3 casas em estudo.", "Se você usou antes a carta boas notas ou vestibular, suba 2 casas em qualquer caminho."],
"Mentoria":["Fez uma mentoria para acelerar\no seu desenvolvimento\nprofissional suba 2 casas em\ntrabalho.", "Melhorou seu foco e\nplanejamento suba 1 casa em\nestudo."],
"Burnout":["Houve uma queda de eficácia\nprofissional volte 3 casas em\ntrabalho.", "Teve exaustão física, mental e\nemocional volte 2 casas em\nbem-estar."],
"Networking":["Gerou novos clientes através\nde conexões suba 2 casas em\ntrabalho.", "Criou networking com várias\npessoas suba 1 casa em vida\npessoal."],
"Leitura":["Aprendeu novos\nconhecimentos lendo suba 2\ncasas em estudo.", "Treinou sua mente lendo suba\n1 casa em bem-estar."],
"Distração":["Está perdendo o foco nos\nestudos volte 2 casas em\nestudo.", "Foi pego no trabalho mexendo\nno celular volte 1 casa em\ntrabalho."],
"Curso online":["Começou um curso para\naumentar seus conhecimentos\nsuba 3 casas em estudos.", "Está sem tempo para relaxar\nvolte 1 casa em bem-estar."],
"Meditação":["Alinhou os seus chakras suba 3\ncasas em bem-estar.", "Reduziu a ansiedade antes da\nprova suba 1 casa em estudo."],
"Sedentarismo":["A falta de atividade física te\ndeixou doente volte 2 casas\nem bem-estar.", "Faltou o trabalho para assistir\nTV volte 1 casa em trabalho."],
"Caminhada":["A prática da caminhada melhorou\nsua saúde suba 2 casas em\nbem-estar.", "Você atingiu sua meta ao\ncaminhar regularmente suba\numa casa em vida pessoal."],
"Voluntariado":["Fez uma boa ação isso\naumentou sua credibilidade\nsuba 3 casas em vida pessoal.", "Melhorou sua saúde mental,\nemocional, física e social suba 1\ncasa em bem-estar."],
"Briga":["Essa briga te fez perder a\nconfiança do seu amigo volte 3\ncasas em vida pessoal.", "Houve danos físicos e\nemocionais volte 1 casa em\nbem-estar."],
"Viagem":["A viagem foi um marco na sua\nvida suba 3 casas em vida\npessoal.", "Voltou ao trabalho com uma\nqueda de produtividade volte 1\ncasa em trabalho."]
};
function effT(c){const t=TXT[c.n];if(t)return`<span class="txt${t[0].includes('\n') ? ' original-wrap' : ''}">${t.map(p=>`<span class="s">${p}</span>`).join('')}</span>`;return`<span class="txt">${c.ef.map(([k,v])=>{const a=Math.abs(v);return`<span class="s">${v>0?'Suba':'Volte'} ${a} ${a==1?'casa':'casas'} em ${TN[ki(k)].toLowerCase()}.</span>`}).join('')}</span>`}

const slug=n=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let S=null,NP=2;
const cur=()=>(S.round%S.n+S.pos)%S.n;
const pt=(r,a)=>[r*Math.cos(a*Math.PI/180),r*Math.sin(a*Math.PI/180)];
const f=n=>n.toFixed(1);
function sector(r1,r2,a1,a2){const A=pt(r1,a1),B=pt(r2,a1),C=pt(r2,a2),D=pt(r1,a2);return`M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}A${r2} ${r2} 0 0 1 ${f(C[0])} ${f(C[1])}L${f(D[0])} ${f(D[1])}A${r1} ${r1} 0 0 0 ${f(A[0])} ${f(A[1])}Z`}
// Tabuleiro: imagem do design novo (img/tabuleiro.webp, 1600x1600, centro em 800,800) com peões desenhados por cima.
// Cada jogador tem um quadrante; dentro dele, as trilhas seguem a ordem Vida pessoal, Trabalho, Bem-estar, Estudo (a partir do eixo do quadrante).
const BOARD_IMG='img/tabuleiro.webp',BR=[169,282,328,376,422,469,516,563,610],BSLOT=['V','T','B','E'],BC=BR.slice(0,8).map((r,i)=>(r+BR[i+1])/2);
function bpos(v){const b=Math.max(0,Math.min(8,v*8/M));if(b<1)return 148+(BC[0]-148)*b;const k=Math.floor(b);return k>=8?BC[7]:BC[k-1]+(BC[k]-BC[k-1])*(b-k)}
function boardSVG(){const n=S?S.n:4,rd=Math.PI/180;let s='<svg viewBox="0 0 1600 1600" role="img" aria-label="Tabuleiro CHOICES">';
const img=(x)=>`<image href="${BOARD_IMG}" x="0" y="0" width="1600" height="1600"${x||''}/>`;
if(n>=4)s+=img();else{for(let p=0;p<4;p++){const a=QA[p],P=[0,45,90].map(d=>[800+1200*Math.cos((a+d)*rd),800+1200*Math.sin((a+d)*rd)]);
s+=`<clipPath id="bq${p}"><path d="M800 800L${P.map(q=>f(q[0])+' '+f(q[1])).join('L')}Z"/></clipPath>`+img(` clip-path="url(#bq${p})" opacity="${p<n?1:.28}"`)}s+='<clipPath id="bc"><circle cx="800" cy="800" r="172"/></clipPath>'+img(' clip-path="url(#bc)"')}
s+='<g transform="translate(800 800)">';
if(S){for(let p=0;p<n;p++){const a0=QA[p],act=S.pl[p];
for(let t=0;t<4;t++){const k=BSLOT[t],ti=ki(k),v=act.v[ti],lit=Math.floor(Math.max(0,Math.min(8,v*8/M))+.5);
for(let i=lit+1;i<=8;i++){const rm=(BR[i-1]+BR[i])/2,ins=(9/rm)/rd;s+=`<path d="${sector(BR[i-1]+2,BR[i]-2,a0+t*22.5+ins,a0+(t+1)*22.5-ins)}" fill="#fff" fill-opacity=".5"/>`}}
for(let t=0;t<4;t++){const k=BSLOT[t],v=act.v[ki(k)],am=a0+t*22.5+11.25,m=pt(bpos(v),am),pc=TC[PC[p]];
s+=`<g><circle cx="${f(m[0])}" cy="${f(m[1])}" r="30" fill="#1b2233"/><circle cx="${f(m[0])}" cy="${f(m[1])}" r="24" fill="${pc}"/><text x="${f(m[0])}" y="${f(m[1]+1)}" text-anchor="middle" dominant-baseline="central" font-size="28" font-weight="800" fill="${PC[p]=='E'?'#1b2233':'#fff'}" font-family="Bricolage Grotesque,sans-serif">${p+1}</text></g>`}}}
return s+'</g></svg>'}
function score(){if(!S)return'';let h='<table><tr><th>Jogador</th>'+TK.map(k=>`<th>${TN[ki(k)].split(' ')[0]}</th>`).join('')+'</tr>';
S.pl.forEach((p,i)=>{h+=`<tr class="${S.ph!='end'&&S.ph!='prep'&&i==cur()?'me':''}"><td><span class="dot" style="background:${TC[PC[i]]}"></span>${p.name}</td>`+p.v.map(v=>v>=M?'<td class="ok">✓</td>':`<td>${v}/${M}</td>`).join('')+'</tr>'});return h+'</table>'}
function chips(ef,x){return ef.map(([k,d])=>`<span class="ch" style="background:${TC[k]}">${TN[ki(k)].split(' ')[0]} ${d>0?'+':''}${d}</span>`).join('')}
function cardH(i,cls,tag){const c=EV[i];let x=TXT[c.n]?'':c.any?`<span class="x">+2 em qualquer trilha se já jogou ${c.any.join(' ou ')}</span>`:c.pen?`<span class="x">−4 em Vida pessoal se já jogou ${c.pen}</span>`:'';
return`<${tag||'div'} class="card ${cls||''}" style="--c:${TC[c.c]}"><span class="in"><h4>${c.n}</h4><img class="art" src="${ART_DIR}${slug(c.n)}.${ART_EXT}" alt="" onerror="this.remove()">${effT(c)}${x}</span></${tag||'div'}>`}
function draw(p){if(!S.deck.length){S.deck=sh(S.disc);S.disc=[]}if(S.deck.length)p.hand.push(S.deck.pop())}
function setN(n){NP=n;render()}
function start(names){const nm=names??[...document.querySelectorAll('.nm')].map((e,i)=>e.value.trim()||'Jogador '+(i+1));
S={n:nm.length,pl:nm.map((name,p)=>{const pool=ST.filter(s=>s[0]==PC[p]),s=pool[Math.floor(Math.random()*pool.length)];return{name,v:[...s[1]],hand:[],used:[],cnt:{T:0,E:0,B:0,V:0}}}),deck:sh(EV.map((_,i)=>i)),disc:[],round:0,pos:0,color:null,ph:'prep',rl:[],trend:rt()};
S.pl.forEach(p=>{for(let i=0;i<7;i++)draw(p)});render()}
function begin(){S.ph=(S.n==1||S.online)?'turn':'pass';render()}
function pick(k){S.color=k;render()}
function apply(p,k,d){const i=ki(k);if(d>0&&S.card!=null&&EV[S.card].c==S.trend)d++;if(p.v[i]>=M){S.log.push(`<li>${TN[i]}: concluída e imune</li>`);return}const o=p.v[i];p.v[i]=Math.max(0,Math.min(M,o+d));S.rl.push([cur(),i,p.v[i]-o]);S.log.push(`<li>${TN[i]}: ${o} → ${p.v[i]} <span class="${d>0?'up':'dn'}">(${d>0?'+':''}${d})</span>${p.v[i]>=M?' 🎉 trilha concluída!':''}</li>`)}
function play(i){const p=S.pl[cur()],ci=p.hand[i],c=EV[ci];if(c.c!=S.color)return;p.hand.splice(i,1);p.cnt[c.c]++;S.card=ci;S.log=[];S.pend=false;
c.ef.forEach(([k,d])=>apply(p,k,d));
const used=n=>p.used.includes(n);
if(c.pen&&used(c.pen))apply(p,'V',-4);
if(c.any&&c.any.some(used)){if(p.v.some(v=>v<M))S.pend=true;else S.log.push('<li>Bônus +2: todas as trilhas já concluídas</li>')}
if(!S.pend)fin();else render()}
function bonus(t){apply(S.pl[cur()],TK[t],2);fin()}
function fin(){const p=S.pl[cur()],c=EV[S.card];S.pend=false;p.used.push(c.n);S.disc.push(S.card);while(p.hand.length<7&&(S.deck.length||S.disc.length))draw(p);S.ph='result';render()}
function nxt(){const p=S.pl[cur()];if(S.ph=='result'&&p.v.every(v=>v>=M)){S.win=cur();S.ph='end';return render()}
S.pos++;if(S.pos>=S.n){S.ph='sum';S.eq=bal();return render()}S.ph=(S.n==1||S.online)?'turn':'pass';render()}
function nr(){const w=S.pl.findIndex(q=>q.v.every(v=>v>=M));if(w>=0){S.win=w;S.ph='end';return render()}S.pos=0;S.round++;S.color=null;S.rl=[];S.trend=rt();S.ph=(S.n==1||S.online)?'turn':'pass';render()}
function skip(){S.card=null;nxt()}
const rt=()=>TK[Math.floor(Math.random()*4)];
function bal(){const o=[];S.pl.forEach((q,i)=>{const mx=Math.max(...q.v),mn=Math.min(...q.v),t=q.v.indexOf(mn);if(mx-mn<=1&&mn>=2&&q.v[t]<M){q.v[t]++;o.push([i,t])}});return o}
const G={T:'Você investiu na carreira. Resultado vem da constância.',E:'Aprender hoje abre portas amanhã.',B:'Cuidar de si sustenta todo o resto.',V:'Vínculos e tempo de qualidade também são conquistas.'},L={T:'O trabalho pesou. Faltou planejamento?',E:'Os estudos ficaram para trás: ainda dá tempo de recuperar.',B:'O bem-estar caiu. Corpo e mente pedem atenção.',V:'A vida pessoal perdeu espaço. Quem ficou de fora?'},Q=['Qual escolha desta rodada você repetiria na vida real?','Que trilha você está negligenciando agora?','Como o bem-estar influencia seus outros resultados?','O que você sacrificaria hoje para ganhar amanhã?','Quem te ajuda a manter o equilíbrio?'],PN={T:'Foco na carreira',E:'Mente curiosa',B:'Cuidado consigo',V:'Coração em primeiro lugar'};
function sumH(){let h=`<h3>Resumo da rodada ${S.round+1}</h3><ul class="log">`;S.pl.forEach((q,i)=>{const net=[0,0,0,0];S.rl.forEach(([pi,t,d])=>{if(pi==i)net[t]+=d});const mx=Math.max(...net),mn=Math.min(...net),ph=mn<0&&-mn>=mx?L[TK[net.indexOf(mn)]]:mx>0?G[TK[net.indexOf(mx)]]:'Rodada de pausa: não jogar também é uma escolha.';h+=`<li><b>${q.name}</b> ${net.map((d,t)=>d?`<span class="ch" style="background:${TC[TK[t]]}">${TN[t].split(' ')[0]} ${d>0?'+':''}${d}</span>`:'').join('')}<br><i>${ph}</i></li>`});S.eq.forEach(([i,t])=>{h+=`<li>⚖️ <b>${S.pl[i].name}</b> manteve as trilhas equilibradas: +1 em ${TN[t]}</li>`});return h+`</ul><p class="rules">💬 ${Q[S.round%Q.length]}</p><div class="qt">${FQ[(S.round*3+1)%FQ.length]}</div><p class="center"><button class="btn" onclick="nr()">Próxima rodada</button></p>`}
function prof(){return'<ul class="log">'+S.pl.map(q=>{const c=Object.entries(q.cnt).sort((a,b)=>b[1]-a[1]);return`<li><b>${q.name}</b>: ${c[0][1]-c[3][1]<=2?'Equilibrista':PN[c[0][0]]}</li>`}).join('')+'</ul><p class="rules">💬 Qual escolha mais mudou o seu jogo?</p><div class="qt">'+FQ[Math.floor(Math.random()*FQ.length)]+'</div>'}
function render(){$('board').innerHTML=boardSVG()+score();let h='';
if(!S){h=`<h2>Nova partida</h2><p class="rules">Versão digital do jogo de tabuleiro: passe o aparelho entre os jogadores.</p><div class="np">${[1,2,3,4].map(n=>`<button class="btn ${n==NP?'on':''}" onclick="setN(${n})">${n}</button>`).join('')}</div><div class="rules">Duração da partida (casas por trilha)</div><div class="np">${[6,8,10].map(m=>`<button class="btn ${m==M?'on':''}" onclick="M=${m};render()">${m==6?'Rápida · 6':m==8?'Padrão · 8':'Longa · 10'}</button>`).join('')}</div>`+Array.from({length:NP},(_,i)=>`<label><span class="dot" style="background:${TC[PC[i]]}"></span>Jogador ${i+1}<input class="nm" maxlength="14" placeholder="Jogador ${i+1}"></label>`).join('')+`<p><button class="btn" onclick="start()">Começar partida</button></p><details class="rules"><summary><b>Como jogar</b></summary><ol><li>Cada jogador começa com uma carta inicial da cor do seu quadrante e 7 cartas de evento na mão.</li><li>Na sua vez de escolher, você define a cor; todos jogam uma carta dessa cor. Quem não tiver, passa.</li><li>Depois de jogar, compre até ter 7 cartas.</li><li>Trilhas não ficam abaixo de 0. Ao chegar em ${M}, a trilha é concluída e fica imune.</li><li>Vence quem concluir as quatro trilhas primeiro.</li></ol></details>`;
$('panel').innerHTML=h;return}
const p=S.pl[S.ph=='end'?S.win:cur()];
if(S.online&&S.ph!=='end'&&!choicesOnline.canAct()){
  $('panel').innerHTML=`<h2>Aguardando ${choicesOnline.actorName()}</h2><p class="rules">O tabuleiro é atualizado a cada jogada.</p>`;
  return;
}
if(S.ph=='prep')h=`<h2>Cartas iniciais</h2><p class="rules">Os valores da carta sorteada definem a posição inicial de cada jogador.</p><div class="prep">`+S.pl.map((q,i)=>`<div class="pcard" style="--c:${TC[PC[i]]}"><h4>${q.name}</h4><div>${TK.map((k,t)=>`<span class="ch" style="background:${TC[k]}">${TN[t].split(' ')[0]} ${q.v[t]}</span>`).join('')}</div></div>`).join('')+`</div><p class="center"><button class="btn" onclick="begin()">Iniciar rodada 1</button></p>`;
else if(S.ph=='pass')h=`<div class="center" style="padding:40px 0"><p class="rules">Rodada ${S.round+1}${S.pos==0?' · você escolhe a cor':''}</p><h2>Passe o aparelho para<br>${p.name}</h2><p><button class="btn" onclick="S.ph='turn';render()">Estou pronto</button></p></div>`;
else if(S.ph=='turn'){const lead=S.pos==0&&S.color==null,has=p.hand.some(i=>EV[i].c==S.color);
h=`<div class="bar"><span class="pill">Rodada ${S.round+1}</span><span class="pill">Vez de ${p.name}</span><span class="pill" style="border-color:${TC[S.trend]}">📈 Tendência: ${CN[S.trend]} +1 nos ganhos</span>${S.color?`<span class="pill" style="border-color:${TC[S.color]}">Cor: ${CN[S.color]}</span>`:''}</div>`;
if(S.pend)h+=`<h3>Bônus +2: escolha a trilha</h3><div class="colors">${TK.map((k,t)=>p.v[t]<M?`<button class="btn" style="background:${TC[k]}" onclick="bonus(${t})">${TN[t]} (${p.v[t]})</button>`:'').join('')}</div>`;
else{if(lead)h+=`<h3>Escolha a cor desta rodada</h3><div class="colors">${TK.map(k=>`<button class="btn" style="background:${TC[k]}" onclick="pick('${k}')">${CN[k]} · ${TN[ki(k)]} (${p.hand.filter(i=>EV[i].c==k).length})</button>`).join('')}</div>`;
else h+=`<h3>Jogue uma carta ${CN[S.color].toLowerCase()}</h3>`;
h+=`<div class="hand">`+p.hand.map((ci,i)=>S.color&&EV[ci].c==S.color?cardH(ci,'go','button').replace('<button','<button onclick="play('+i+')"'):cardH(ci,'off')).join('')+`</div>`;
if(S.color&&!has)h+=`<p class="center"><button class="btn" onclick="skip()">Sem carta da cor: passar a vez</button></p>`}}
else if(S.ph=='sum')h=sumH();else if(S.ph=='result')h=`<div class="center"><h3>${p.name} jogou</h3>${cardH(S.card,'big')}<ul class="log">${S.log.join('')}</ul><button class="btn" onclick="nxt()">Continuar</button></div>`;
else h=`<div class="center" style="padding:20px 0"><p style="font-size:56px;margin:0">🏆</p><h2>${p.name} venceu!</h2><p class="rules">Concluiu as quatro trilhas em ${S.round+1} rodadas.</p>${prof()}<button class="btn" onclick="resetGame()">Jogar de novo</button></div>`;
$('panel').innerHTML=h}
$('th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=d?'light':'dark'};
const q=(t,a)=>`“${t}”${a?`<small>— ${a}</small>`:''}`;
const FQ=[q('Uma vida sem reflexão não vale a pena ser vivida.','Sócrates'),q('Conhece-te a ti mesmo.','inscrição do Templo de Delfos'),q('Ninguém entra duas vezes no mesmo rio.','Heráclito'),q('Não nos falta tempo: desperdiçamos muito dele.','inspirado em Sêneca'),q('O que nos perturba não são as coisas, mas o modo como as interpretamos.','inspirado em Epicteto'),q('Escolher um caminho é renunciar a todos os outros.'),q('Equilíbrio não é dividir o tempo igualmente, é saber o que pede atenção agora.'),q('O descanso também faz parte do caminho.'),q('Quem só corre numa direção esquece de quem caminha ao lado.'),q('Todo sucesso carrega uma escolha que ninguém viu.'),q('O hábito de hoje é o resultado de amanhã.'),q('Cada casa que você sobe pode custar uma casa em outra trilha.')];
let qi=0;function showQ(){['hq','qb'].forEach(id=>{const e=$(id);e.style.opacity=0;setTimeout(()=>{e.innerHTML=FQ[qi];e.style.opacity=1},350)});qi=(qi+1)%FQ.length}
function showG(k){document.querySelectorAll('.flt .btn').forEach(b=>b.classList.toggle('on',b.dataset.k==k));$('gal').innerHTML=EV.map((c,i)=>!k||c.c==k?cardH(i):'').join('')}
$('flt').innerHTML=[['','Todas']].concat(TK.map(k=>[k,TN[ki(k)]])).map(([k,n])=>`<button class="btn ${k?'':'on'}" data-k="${k}" onclick="showG('${k}')">${n}</button>`).join('');
showG('');showQ();setInterval(showQ,9000);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.rv').forEach(e=>io.observe(e));
render();

function resetGame(){if(S?.online){choicesOnline.leave();return}S=null;render()}
