<div align="center">

<img src="assets/logo.svg" alt="Logo Countable & Uncountable" width="120">

# Countable & Uncountable

### Business English Challenge

Aprenda, pratique e dispute substantivos **contáveis** e **incontáveis** em situações reais de escritório.
Um jogo bilíngue (EN/PT), sem dependências, que roda direto no navegador.

![HTML5](https://img.shields.io/badge/HTML5-0F3D2E?style=for-the-badge&logo=html5&logoColor=FFB37A)
![CSS3](https://img.shields.io/badge/CSS3-0F3D2E?style=for-the-badge&logo=css3&logoColor=FFB37A)
![JavaScript](https://img.shields.io/badge/JavaScript-0F3D2E?style=for-the-badge&logo=javascript&logoColor=FFB37A)
![Sem dependências](https://img.shields.io/badge/sem%20depend%C3%AAncias-FF6B1A?style=for-the-badge)

</div>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Como rodar](#como-rodar)
- [Modo Sala de Aula](#modo-sala-de-aula)
- [Gamificação do Desafio](#gamificação-do-desafio)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como editar o conteúdo](#como-editar-o-conteúdo)
- [A intro](#a-intro)
- [Design](#design)
- [Acessibilidade e responsividade](#acessibilidade-e-responsividade)
- [Autores](#autores)

---

## Sobre o projeto

Em inglês de negócios, erros como *"informations"* ou *"many money"* aparecem o tempo todo. Este projeto transforma a regra de **countable vs. uncountable** em uma experiência interativa, com vocabulário real de escritório (*email, invoice, meeting, feedback, equipment, furniture…*).

O site tem três modos de uso:

| Modo | Para quê |
| --- | --- |
| **Learn** | Glossário com 16 termos de escritório, exemplos e áudio |
| **Challenge** | Quiz solo de 15 perguntas com XP, combos, níveis e conquistas |
| **Classroom Mode** | Disputa ao vivo entre duas equipes, pensada para projetor |

Tudo funciona em **inglês e português**, com troca instantânea de idioma em qualquer tela.

---

## Funcionalidades

- **Intro cinematográfica** em 3 cenas, que termina sozinha e leva ao menu.
- **Glossário (Learn)** com 16 palavras, filtro por tipo (*All / Countable / Uncountable*), busca por palavra e frases de exemplo nos dois idiomas.
- **Áudio** nas palavras e exemplos, usando a síntese de voz do próprio navegador (`en-US` e `pt-BR`), sem arquivos de áudio e sem internet.
- **Desafio solo** com 15 perguntas, 20 segundos por questão, dicas, botão de tradução da pergunta e explicação após cada resposta.
- **XP, combo, níveis, ranking final e conquistas**, com confete no resultado.
- **Modo Sala de Aula** com Equipe A vs. Equipe B, placar ao vivo, nomes editáveis, sorteio de nomes e atalhos de teclado para o professor.
- **Bilíngue (EN/PT)** em todas as telas, com animação na troca de texto.
- **Sem build e sem dependências**: apenas HTML, CSS e JavaScript puros.

---

## Como rodar

Não precisa instalar nada.

**Opção 1: abrir direto**
Baixe o projeto e abra o `index.html` no navegador.

**Opção 2: servidor local** (opcional)

```bash
# com Python
python -m http.server 8000

# ou com Node
npx serve
```

Depois acesse `http://localhost:8000`.

**Opção 3: GitHub Pages**
No repositório, vá em *Settings → Pages*, escolha a branch `main` e a pasta `/ (root)`. O site fica publicado em poucos minutos.

> As fontes (Sora, Inter e JetBrains Mono) são carregadas do Google Fonts. Sem internet, o site usa fontes do sistema e continua funcionando.

---

## Modo Sala de Aula

Feito para ser projetado: o professor conduz a partida e a turma disputa em duas equipes.

1. Escolha o nome das equipes (ou use **Random team names** para sortear).
2. Clique em **Start Session**.
3. São sorteadas **10 perguntas** entre as 15 do banco, sem repetição.
4. A cada pergunta, o professor revela a resposta e atribui o ponto.
5. Ao final, aparece a tela da equipe vencedora.

### Atalhos do professor

| Tecla | Ação |
| --- | --- |
| `Espaço` ou `R` | Revelar a resposta |
| `1` | Ponto para a Equipe A |
| `2` | Ponto para a Equipe B |
| `0` | Ninguém pontuou |
| `U` | Desfazer a última pontuação |
| `N` ou `→` | Próxima pergunta |
| `T` | Traduzir a pergunta (EN/PT) |

---

## Gamificação do Desafio

**Pontuação**
- Cada acerto vale `10 XP` + bônus de combo (`combo × 2`, limitado a `+20`).
- Errar ou deixar o tempo acabar zera o combo.
- A cada `60 XP` você sobe um nível.

**Ranking final** (pela porcentagem de acertos)

| Acertos | Ranking |
| --- | --- |
| 90% ou mais | 👔 **CEO Material** |
| 70% a 89% | ⭐ **Great Professional** |
| 50% a 69% | 📈 **Good Start** |
| Abaixo de 50% | ☕ **Need More Coffee** |

**Conquistas**

| Conquista | Como ganhar |
| --- | --- |
| 🥇 First Correct Answer | Acertar ao menos uma pergunta |
| 🔥 Combo x3 | Chegar a 3 acertos seguidos |
| 💎 Perfect Accuracy | Acertar 100% das perguntas |
| 🏆 Challenge Survivor | Terminar o desafio |

---

## Estrutura do projeto

```text
.
├── index.html      # Todas as telas: intro, menu, Learn, Challenge, Classroom
├── styles.css      # Design system, animações e responsividade
├── app.js          # Navegação, intro, i18n, áudio, desafio e sala de aula
├── data.js         # Conteúdo: vocabulário, perguntas e rankings
├── assets/
│   └── logo.svg    # Logo usado neste README
└── README.md
```

O site é uma *single page*: cada tela é uma `<section class="screen">` e a função `goTo(id)` alterna entre elas.

---

## Como editar o conteúdo

Todo o conteúdo fica no `data.js`, então dá para adaptar o jogo sem mexer no resto do código.

### Adicionar uma palavra ao glossário

`type` é `"C"` (contável) ou `"U"` (incontável).

```js
{ en:"invoice", pt:"fatura", type:"C",
  exEn:"Please send the invoice by Friday.",
  exPt:"Por favor, envie a fatura até sexta." },
```

### Adicionar uma pergunta ao quiz

`c` é o índice da alternativa correta em `o` (começa em 0). Os campos `q`, `e` e `h` têm sempre `[inglês, português]`.

```js
{ q:["We need ___ information before the meeting.",
     "Precisamos de ___ informação antes da reunião."],
  o:["much","many","a","an"],
  c:0,
  e:["Information is uncountable, so we use 'much'.",
     "Information é incontável, por isso usamos 'much'."],
  h:["Think: can you count 'informations'?",
     "Pense: dá pra contar 'informations'?"] },
```

> Depois de mudar a quantidade de palavras ou perguntas, atualize também os textos fixos do `index.html` que mostram esses números (ex.: *16 WORDS*, *15 QUESTIONS*).

### Ajustar os rankings

Em `RANKS`, cada item tem `min` (porcentagem mínima), `title`, `desc` e `emoji`.

---

## A intro

A intro tem 3 cenas e termina sozinha, levando ao menu:

1. **Gancho:** um contador anima *"1, 2, 3 emails."* e depois surge *"Some information."* com uma onda embaixo, mostrando a ideia do projeto em poucos segundos.
2. **Título:** o logo é desenhado traço a traço, **COUNTABLE** se monta letra por letra e **UNCOUNTABLE** se enche como um líquido.
3. **Créditos:** os autores aparecem e a intro se dissolve em direção ao menu.

Para ajustar a duração, edite a constante no topo do `app.js` (valores em milissegundos, uma cena por item):

```js
const INTRO_TIMES=[5400,6600,4600];
```

**Controles:** `Skip` (botão), `Esc` (pular tudo) e `Espaço`, `Enter` ou `→` (avançar uma cena).

---

## Design

Tema **"Fresh Office"**: verde-floresta com laranja de destaque, pensado para um clima profissional.

| Cor | Hex | Uso |
| --- | --- | --- |
| Forest 900 | `#0A2A1F` | Fundo da intro e títulos |
| Forest 800 | `#0F3D2E` | Cor principal da marca |
| Forest 600 | `#24714F` | Botões e detalhes |
| Orange 500 | `#FF6B1A` | Destaques e chamadas de ação |
| Orange 300 | `#FFB37A` | Detalhes sobre fundo escuro |
| Cream | `#FBF9F5` | Fundo das telas |

**Tipografia**
- **Sora** para títulos
- **Inter** para textos
- **JetBrains Mono** para rótulos e números

Todas as cores, raios e sombras estão como variáveis CSS no `:root` do `styles.css`, então dá para trocar a identidade visual em um só lugar.

---

## Acessibilidade e responsividade

- Layout responsivo, com ajustes específicos para telas de até 640 px.
- A intro respeita `prefers-reduced-motion` e reduz as animações para quem prefere menos movimento.
- Foco visível nos botões da intro e rótulos `aria-label` nos elementos principais.
- Ícones decorativos marcados com `aria-hidden`.
- Funciona em navegadores modernos (Chrome, Edge, Firefox e Safari). O áudio depende das vozes instaladas no sistema.

---

## Autores

Projeto criado por **Albert Dias** e **Sandra Alencar**.

<div align="center">

<sub>Business English · Learn · Practice · Challenge</sub>

</div>
