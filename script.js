/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL = "https://hyjuuzqdxdarumsqopvn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_aaTHViraL-2HzMThmc8ekQ_BYXrjSYH";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const WHATSAPP_NUMBER = "5547988471657";

let cart = [];
let procedimentosBanco = [];


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizarTexto(texto) {

    if (!texto) return "";

    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "";
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return "";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* =====================================================
   APELIDOS E VARIAÇÕES DOS PROCEDIMENTOS
===================================================== */

const aliasesProcedimentos = {

    /* =========================
       CÍLIOS
    ========================== */

    "cilios light":
        "luz de volume",

    "cilios luz de volume":
        "luz de volume",

    "volume light":
        "luz de volume",

    "luz de volume":
        "luz de volume",

    "cilios brasileiro":
        "volume brasileiro",

    "volume brasileiro":
        "volume brasileiro",

    "cilios egipcio":
        "volume egipcio",

    "volume egipcio":
        "volume egipcio",

    "volume brasileiro volumoso":
        "volume brasileiro volumoso",

    "brasileiro volumoso":
        "volume brasileiro volumoso",


    /* =========================
       UNHAS
    ========================== */

    "alongamento quadrado":
        "alongamento quadrado",

    "alongamento quadrada":
        "alongamento quadrado",

    "alongamento almond":
        "alongamento de amêndoa",

    "alongamento de amendoa":
        "alongamento de amêndoa",

    "alongamento de amêndoa":
        "alongamento de amêndoa",

    "alongamento stiletto":
        "alongamento stiletto",

    "blindagem com decoração":
        "blindagem com decoração",

    "blindagem com esmaltação em gel":
        "blindagem com esmaltação em gel",

    "blindagem + esmaltação em gel":
        "blindagem com esmaltação em gel",

    "esmaltação em gel lisa":
        "esmaltação em gel",

    "esmaltação em gel":
        "esmaltação em gel",

    "manutenção de esmaltação em gel":
        "manutenção com esmaltação em gel",

    "manutenção com esmaltação em gel":
        "manutenção com esmaltação em gel",

    "remoção":
        "remoção de gel ou alongamentos",

    "remoção de gel ou alongamento":
        "remoção de gel ou alongamentos",

    "remoção de gel ou alongamentos":
        "remoção de gel ou alongamentos",


    /* =========================
       SOBRANCELHAS
    ========================== */

    "design de sobrancelhas sem henna":
        "personalizado sem rena",

    "design de sobrancelhas com henna":
        "design com rena",

    "personalizado sem rena":
        "personalizado sem rena",

    "personalizado sem henna":
        "personalizado sem rena",

    "design com rena":
        "design com rena",

    "design com henna":
        "design com rena",


    /* =========================
       DEPILAÇÃO
    ========================== */

    "depilação axila":
        "axila",

    "depilação antebraço":
        "antebraço",

    "depilação buço":
        "buço",

    "depilação perna inteira":
        "perna inteira",

    "depilação meia perna":
        "meia perna",

    "depilação virilha comum":
        "virilha comum",

    "depilação virilha total":
        "virilha total",

    "virilha comum":
        "virilha comum",

    "virilha total":
        "virilha total",


    /* =========================
       OUTROS
    ========================== */

    "spa dos pés":
        "spa dos pés",

    "manicure tradicional":
        "manicure tradicional",

    "pedicure tradicional":
        "pedicure tradicional",

    "manicure + pedicure":
        "manicure + pedicure"

};


/* =====================================================
   CRIAR VARIAÇÕES DE UM PROCEDIMENTO
===================================================== */

function obterNomesEquivalentes(nome) {

    const nomes = new Set();

    const original =
        normalizarTexto(nome);

    if (!original) {
        return [];
    }

    nomes.add(original);


    /* Alias direto */

    if (aliasesProcedimentos[original]) {

        nomes.add(
            normalizarTexto(
                aliasesProcedimentos[original]
            )
        );

    }


    /* Procura aliases que apontam para o nome */

    Object.entries(
        aliasesProcedimentos
    ).forEach(([alias, destino]) => {

        const destinoNormalizado =
            normalizarTexto(destino);

        if (
            destinoNormalizado === original
        ) {

            nomes.add(
                normalizarTexto(alias)
            );

        }

    });


    return [
        ...nomes
    ];

}


/* =====================================================
   PEGAR NOME DO PROCEDIMENTO DO BANCO
===================================================== */

function obterNomeProcedimento(procedimento) {

    if (!procedimento) {
        return "";
    }

    return (
        procedimento.nome ||
        procedimento.name ||
        ""
    );

}


/* =====================================================
   PEGAR PREÇO DO PROCEDIMENTO
===================================================== */

function obterPrecoProcedimento(procedimento) {

    if (!procedimento) {
        return 0;
    }

    return (
        procedimento.preco ??
        procedimento.preco_base ??
        procedimento.valor ??
        procedimento.price ??
        0
    );

}


/* =====================================================
   ENCONTRAR PROCEDIMENTO NO SUPABASE
===================================================== */

function encontrarProcedimento(nomeHTML) {

    if (
        !nomeHTML ||
        !procedimentosBanco.length
    ) {
        return null;
    }


    const nomeNormalizado =
        normalizarTexto(nomeHTML);


    /* ---------------------------------------------
       NOMES EQUIVALENTES
    --------------------------------------------- */

    const nomesEquivalentes =
        obterNomesEquivalentes(nomeHTML);


    /* ---------------------------------------------
       1. BUSCA EXATA
    --------------------------------------------- */

    let procedimento =
        procedimentosBanco.find(item => {

            const nomeBanco =
                normalizarTexto(
                    item.nome
                );

            const nameBanco =
                normalizarTexto(
                    item.name
                );

            return (
                nomesEquivalentes.includes(nomeBanco) ||
                nomesEquivalentes.includes(nameBanco)
            );

        });


    if (procedimento) {
        return procedimento;
    }


    /* ---------------------------------------------
       2. BUSCA PELO ALIAS DIRETO
    --------------------------------------------- */

    const alias =
        aliasesProcedimentos[nomeNormalizado];


    if (alias) {

        const aliasNormalizado =
            normalizarTexto(alias);


        procedimento =
            procedimentosBanco.find(item => {

                const nomeBanco =
                    normalizarTexto(
                        item.nome
                    );

                const nameBanco =
                    normalizarTexto(
                        item.name
                    );

                return (
                    nomeBanco === aliasNormalizado ||
                    nameBanco === aliasNormalizado
                );

            });


        if (procedimento) {
            return procedimento;
        }

    }


    /* ---------------------------------------------
       3. BUSCA POR TEXTO CONTIDO
    --------------------------------------------- */

    const candidatos =
        procedimentosBanco.filter(item => {

            const nomeBanco =
                normalizarTexto(
                    item.nome
                );

            const nameBanco =
                normalizarTexto(
                    item.name
                );


            return nomesEquivalentes.some(nome => {

                return (
                    (
                        nomeBanco &&
                        (
                            nomeBanco.includes(nome) ||
                            nome.includes(nomeBanco)
                        )
                    ) ||
                    (
                        nameBanco &&
                        (
                            nameBanco.includes(nome) ||
                            nome.includes(nameBanco)
                        )
                    )
                );

            });

        });


    if (candidatos.length === 1) {
        return candidatos[0];
    }


    /* ---------------------------------------------
       NÃO ENCONTRADO
    --------------------------------------------- */

    console.warn(
        "Procedimento não encontrado:",
        nomeHTML
    );

    return null;

}


/* =====================================================
   CARREGAR PROCEDIMENTOS DO SUPABASE
===================================================== */

async function carregarProcedimentos() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("procedimento")
            .select("*")
            .eq("ativo", true);


        if (error) {

            console.error(
                "Erro ao carregar procedimentos:",
                error
            );

            return;
        }


        procedimentosBanco =
            data || [];


        console.log(
            "Procedimentos carregados:",
            procedimentosBanco.length
        );


        console.log(
            "Dados dos procedimentos:",
            procedimentosBanco
        );


        atualizarPrecos();

        atualizarFotos();

        ativarBotoesServicos();


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar procedimentos:",
            erro
        );

    }

}


/* =====================================================
   ATUALIZAR PREÇOS
===================================================== */

function atualizarPrecos() {

    document
        .querySelectorAll(
            ".add-service"
        )
        .forEach(button => {

            const nomeHTML =
                button.dataset.service;


            if (!nomeHTML) {
                return;
            }


            const procedimento =
                encontrarProcedimento(
                    nomeHTML
                );


            if (!procedimento) {
                return;
            }


            const preco =
                obterPrecoProcedimento(
                    procedimento
                );


            if (
                preco === null ||
                preco === undefined ||
                preco === ""
            ) {
                return;
            }


            const card =
                button.closest(
                    ".price-card, .simple-card, .service-card, .gallery-card, article, .card"
                );


            if (!card) {
                return;
            }


            const elementosPreco =
                card.querySelectorAll(
                    ".price, .spa-price, strong"
                );


            elementosPreco.forEach(
                elemento => {

                    if (
                        elemento.closest(
                            "button"
                        )
                    ) {
                        return;
                    }


                    elemento.textContent =
                        formatarPreco(
                            preco
                        );

                }
            );

        });

}


/* =====================================================
   ATUALIZAR FOTOS PELO SUPABASE
===================================================== */

function atualizarFotos() {

    if (
        !procedimentosBanco.length
    ) {
        return;
    }


    document
        .querySelectorAll("img")
        .forEach(img => {

            const alt =
                img.alt || "";


            if (!alt) {
                return;
            }


            let procedimento =
                encontrarProcedimento(
                    alt
                );


            /*
               Alguns ALT do HTML podem ser diferentes
               do nome do procedimento.
            */

            if (!procedimento) {

                const altNormalizado =
                    normalizarTexto(
                        alt
                    );


                if (
                    altNormalizado.includes(
                        "volume light"
                    ) ||
                    altNormalizado.includes(
                        "cilios light"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Luz de Volume"
                        );

                }


                else if (
                    altNormalizado.includes(
                        "volume brasileiro"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Volume Brasileiro"
                        );

                }


                else if (
                    altNormalizado.includes(
                        "volume egipcio"
                    ) ||
                    altNormalizado.includes(
                        "cilios egipcio"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Volume Egípcio"
                        );

                }


                else if (
                    altNormalizado.includes(
                        "quadrad"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Alongamento quadrado"
                        );

                }


                else if (
                    altNormalizado.includes(
                        "almond"
                    ) ||
                    altNormalizado.includes(
                        "amendoa"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Alongamento de amêndoa"
                        );

                }


                else if (
                    altNormalizado.includes(
                        "stiletto"
                    )
                ) {

                    procedimento =
                        encontrarProcedimento(
                            "Alongamento stiletto"
                        );

                }

            }


            if (
                !procedimento ||
                !procedimento.foto
            ) {
                return;
            }


            const {
                data
            } = supabaseClient
                .storage
                .from("procedimento")
                .getPublicUrl(
                    procedimento.foto
                );


            if (
                data &&
                data.publicUrl
            ) {

                img.src =
                    data.publicUrl;

            }

        });


    /*
       SPA DOS PÉS
    */

    const spaImagem =
        document.querySelector(
            "#spa .spa-image img"
        );


    if (spaImagem) {

        const procedimento =
            encontrarProcedimento(
                "Spa dos pés"
            );


        if (
            procedimento &&
            procedimento.foto
        ) {

            const {
                data
            } = supabaseClient
                .storage
                .from("procedimento")
                .getPublicUrl(
                    procedimento.foto
                );


            if (
                data &&
                data.publicUrl
            ) {

                spaImagem.src =
                    data.publicUrl;

            }

        }

    }

}


/* =====================================================
   BOTÕES DOS SERVIÇOS
===================================================== */

function ativarBotoesServicos() {

    document
        .querySelectorAll(
            ".add-service"
        )
        .forEach(button => {

            if (
                button.dataset.eventoAtivo ===
                "true"
            ) {
                return;
            }


            button.dataset.eventoAtivo =
                "true";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const nome =
                        this.dataset.service;


                    if (!nome) {

                        console.warn(
                            "Botão sem data-service:",
                            this
                        );

                        return;
                    }


                    const procedimento =
                        encontrarProcedimento(
                            nome
                        );


                    if (!procedimento) {

                        console.warn(
                            "Não foi possível adicionar:",
                            nome
                        );

                        return;
                    }


                    adicionarAoCarrinho(
                        procedimento,
                        this
                    );

                }
            );

        });

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function adicionarAoCarrinho(
    procedimento,
    button = null
) {

    const nome =
        obterNomeProcedimento(
            procedimento
        );


    const preco =
        obterPrecoProcedimento(
            procedimento
        );


    /*
       PEGA A MANUTENÇÃO SELECIONADA.

       Se vier um JSON com várias opções,
       não vamos colocar esse JSON no carrinho.
    */

    let manutencao =
        button?.dataset?.maintenance ||
        "";


    if (manutencao) {

        try {

            const dadosManutencao =
                JSON.parse(
                    manutencao
                );


            /*
               Se for uma lista de opções,
               não mostrar a lista inteira.
            */

            if (
                Array.isArray(
                    dadosManutencao
                )
            ) {

                manutencao = "";

            }

        } catch (erro) {

            /*
               Se não for JSON,
               mantém o texto normalmente.
            */

        }

    }


    const existente =
        cart.find(item => {

            return (
                item.id ===
                    procedimento.id &&
                item.maintenance ===
                    manutencao
            );

        });


    if (existente) {

        existente.quantidade++;

    } else {

        cart.push({

            id:
                procedimento.id,

            nome:
                nome,

            preco:
                Number(preco) || 0,

            maintenance:
                manutencao,

            quantidade:
                1

        });

    }


    renderCart();

    abrirAgendamento();


    if (button) {

        const textoOriginal =
            button.dataset.textoOriginal ||
            button.textContent;


        button.dataset.textoOriginal =
            textoOriginal;


        button.textContent =
            "Adicionado ✓";


        setTimeout(() => {

            button.textContent =
                textoOriginal;

        }, 1500);

    }

}


/* =====================================================
   RENDERIZAR CARRINHO
===================================================== */

function renderCart() {

    const cartItems =
        document.getElementById(
            "cart-items"
        );


    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    const cartCount =
        document.getElementById(
            "cart-count"
        );


    const cartEmpty =
        document.getElementById(
            "cart-empty"
        );


    if (cartItems) {

        cartItems.innerHTML =
            "";


        cart.forEach(
            (item, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "cart-item";


                const subtotal =
                    item.preco *
                    item.quantidade;


                div.innerHTML = `

                    <div class="cart-item-top">

                        <div>

                            <h4>
                                ${item.nome}
                            </h4>

                            ${
                                item.maintenance
                                    ? `
                                        <small>
                                            ${item.maintenance}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>

                        <span class="cart-item-price">
                            ${formatarPreco(subtotal)}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="cart-item-remove"
                        data-index="${index}"
                    >
                        Remover
                    </button>

                `;


                cartItems.appendChild(
                    div
                );

            }
        );


        cartItems
            .querySelectorAll(
                ".cart-item-remove"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function() {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        renderCart();

                    }
                );

            });

    }


    const total =
        cart.reduce(
            (
                soma,
                item
            ) =>
                soma +
                (
                    item.preco *
                    item.quantidade
                ),
            0
        );


    const quantidade =
        cart.reduce(
            (
                soma,
                item
            ) =>
                soma +
                item.quantidade,
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            formatarPreco(
                total
            );

    }


    if (cartCount) {

        cartCount.textContent =
            quantidade;

    }


    if (cartEmpty) {

        cartEmpty.hidden =
            cart.length > 0;

    }

}


/* =====================================================
   LIMPAR CARRINHO
===================================================== */

const clearCart =
    document.getElementById(
        "clear-cart"
    );


if (clearCart) {

    clearCart.addEventListener(
        "click",
        function() {

            cart = [];

            renderCart();

        }
    );

}


/* =====================================================
   BOTÃO DO CARRINHO
===================================================== */

const cartButton =
    document.getElementById(
        "cart-button"
    );


const cartDrawer =
    document.getElementById(
        "cart-drawer"
    );


const cartOverlay =
    document.getElementById(
        "cart-overlay"
    );


const cartClose =
    document.getElementById(
        "cart-close"
    );


/* =====================================================
   ABRIR AGENDAMENTO
===================================================== */

function abrirAgendamento() {

    if (!cartDrawer) {

        console.error(
            "Elemento #cart-drawer não encontrado."
        );

        return;
    }


    cartDrawer.classList.add(
        "active"
    );


    if (cartOverlay) {

        cartOverlay.classList.add(
            "active"
        );

    }


    document.body.classList.add(
        "cart-open"
    );

}


/* =====================================================
   FECHAR AGENDAMENTO
===================================================== */

function fecharAgendamento() {

    if (cartDrawer) {

        cartDrawer.classList.remove(
            "active"
        );

    }


    if (cartOverlay) {

        cartOverlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "cart-open"
    );

}


/* =====================================================
   BOTÃO DO ÍCONE DO CARRINHO
===================================================== */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            abrirAgendamento();

        }
    );

}


/* =====================================================
   BOTÕES "AGENDAR HORÁRIO"
===================================================== */

document
    .querySelectorAll(
        ".open-cart"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                abrirAgendamento();

            }
        );

    });


/* =====================================================
   FECHAR
===================================================== */

if (cartClose) {

    cartClose.addEventListener(
        "click",
        fecharAgendamento
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        fecharAgendamento
    );

}


document
    .querySelectorAll(
        ".close-cart"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            fecharAgendamento
        );

    });


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            fecharAgendamento();

        }

    }
);


/* =====================================================
   MANUTENÇÃO DOS CÍLIOS
===================================================== */

document
    .querySelectorAll(
        "[data-maintenance]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        "[data-maintenance]"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                this.classList.add(
                    "active"
                );


                const maintenance =
                    this.dataset.maintenance;


                const serviceButton =
                    this
                        .closest(
                            ".service-card, .price-card, .gallery-card, article, .card"
                        )
                        ?.querySelector(
                            ".add-service"
                        );


                if (
                    serviceButton &&
                    maintenance
                ) {

                    serviceButton.dataset.maintenance =
                        maintenance;

                }

            }
        );

    });


/* =====================================================
   ENVIAR AGENDAMENTO PELO WHATSAPP
===================================================== */

function enviarAgendamentoWhatsApp() {

    const nome =
        document.getElementById(
            "client-name"
        )?.value.trim();


    const telefone =
        document.getElementById(
            "client-phone"
        )?.value.trim();


    const profissional =
        document.getElementById(
            "professional"
        )?.value;


    const data =
        document.getElementById(
            "booking-date"
        )?.value;


    const horario =
        document.getElementById(
            "booking-time"
        )?.value;


    const pagamento =
        document.getElementById(
            "payment-method"
        )?.value;


    if (!nome) {

        alert(
            "Digite seu nome."
        );

        return;

    }


    if (!telefone) {

        alert(
            "Digite seu telefone."
        );

        return;

    }


    if (!data) {

        alert(
            "Escolha a data."
        );

        return;

    }


    if (!horario) {

        alert(
            "Escolha o horário."
        );

        return;

    }


    if (!pagamento) {

        alert(
            "Escolha a forma de pagamento."
        );

        return;

    }


    if (!cart.length) {

        alert(
            "Adicione pelo menos um procedimento."
        );

        return;

    }


    let mensagem =
        "Olá! Gostaria de agendar um horário.%0A%0A";


    mensagem +=
        "*Cliente:* " +
        encodeURIComponent(
            nome
        ) +
        "%0A";


    mensagem +=
        "*Telefone:* " +
        encodeURIComponent(
            telefone
        ) +
        "%0A";


    if (profissional) {

        mensagem +=
            "*Profissional:* " +
            encodeURIComponent(
                profissional
            ) +
            "%0A";

    }


    mensagem +=
        "*Data:* " +
        encodeURIComponent(
            data
        ) +
        "%0A";


    mensagem +=
        "*Horário:* " +
        encodeURIComponent(
            horario
        ) +
        "%0A";


    mensagem +=
        "*Pagamento:* " +
        encodeURIComponent(
            pagamento
        ) +
        "%0A%0A";


    mensagem +=
        "*Procedimentos:*%0A";


    cart.forEach(
        item => {

            mensagem +=
                "- " +
                encodeURIComponent(
                    item.nome
                ) +
                " x" +
                item.quantidade +
                " - " +
                encodeURIComponent(
                    formatarPreco(
                        item.preco *
                        item.quantidade
                    )
                ) +
                "%0A";


            if (
                item.maintenance
            ) {

                mensagem +=
                    "  Manutenção: " +
                    encodeURIComponent(
                        item.maintenance
                    ) +
                    "%0A";

            }

        }
    );


    const total =
        cart.reduce(
            (
                soma,
                item
            ) =>
                soma +
                (
                    item.preco *
                    item.quantidade
                ),
            0
        );


    mensagem +=
        "%0A*Total:* " +
        encodeURIComponent(
            formatarPreco(
                total
            )
        );


    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   BOTÃO WHATSAPP DO AGENDAMENTO
===================================================== */

const whatsappCart =
    document.getElementById(
        "whatsapp-cart"
    );


if (whatsappCart) {

    whatsappCart.addEventListener(
        "click",
        enviarAgendamentoWhatsApp
    );

}


/* =====================================================
   LINKS DO WHATSAPP
===================================================== */

document
    .querySelectorAll(
        'a[href*="wa.me"]'
    )
    .forEach(link => {

        link.href =
            `https://wa.me/${WHATSAPP_NUMBER}`;

    });


/* =====================================================
   MENU MOBILE
===================================================== */

const menuButton =
    document.getElementById(
        "menu-button"
    );


const nav =
    document.getElementById(
        "nav"
    );


if (
    menuButton &&
    nav
) {

    menuButton.addEventListener(
        "click",
        function() {

            nav.classList.toggle(
                "active"
            );


            menuButton.classList.toggle(
                "active"
            );

        }
    );


    nav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                function() {

                    nav.classList.remove(
                        "active"
                    );


                    menuButton.classList.remove(
                        "active"
                    );

                }
            );

        });

}


/* =====================================================
   ROLAGEM SUAVE
===================================================== */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                const destino =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !destino ||
                    destino === "#"
                ) {
                    return;
                }


                const elemento =
                    document.querySelector(
                        destino
                    );


                if (!elemento) {
                    return;
                }


                event.preventDefault();


                elemento.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );

    });


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

renderCart();

carregarProcedimentos();