/* =====================================================
   CONFIGURAÇÃO DO SUPABASE
===================================================== */

const SUPABASE_URL = "https://hyjuuzqdxdarumsqopvn.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_aaTHViraL-2HzMThmc8ekQ_BYXrjSYH";

let supabaseClient = null;

if (typeof supabase !== "undefined") {

    supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

} else {

    console.error(
        "Supabase não foi carregado. Verifique a ordem dos scripts no HTML."
    );

}


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const WHATSAPP_NUMBER = "5547988471657";

let procedimentosBanco = [];

let cart = [];


/* =====================================================
   MENU MOBILE
===================================================== */

const menuButton =
    document.getElementById("menu-button");

const nav =
    document.getElementById("nav");

if (menuButton && nav) {

    menuButton.addEventListener("click", () => {

        nav.classList.toggle("active");

    });

}


/* =====================================================
   FECHAR MENU AO CLICAR EM LINK
===================================================== */

if (nav) {

    const navLinks =
        nav.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

        });

    });

}


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizeText(text) {

    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();

}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatPrice(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString("pt-BR", {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    });

}


/* =====================================================
   ENCONTRAR PROCEDIMENTO NO BANCO
===================================================== */

function encontrarProcedimento(nomeHTML) {

    const nomeNormalizado =
        normalizeText(nomeHTML);

    if (!nomeNormalizado) {

        return null;

    }


    /* =================================================
       1. PROCURA EXATA
    ================================================= */

    let procedimento =
        procedimentosBanco.find(item => {

            return normalizeText(item.nome) ===
                nomeNormalizado;

        });

    if (procedimento) {

        return procedimento;

    }


    /* =================================================
       2. ALIASES
    ================================================= */

    const aliases = {

        "alongamento quadrado":
            "alongamento quadrada",

        "alongamento almond":
            "alongamento almond",

        "alongamento stiletto":
            "alongamento stiletto",

        "spa dos pes":
            "spa dos pes",

        "manutencao":
            "manutencao",

        "remocao":
            "remocao"

    };


    const nomeAlias =
        aliases[nomeNormalizado];

    if (nomeAlias) {

        procedimento =
            procedimentosBanco.find(item => {

                return normalizeText(item.nome) ===
                    nomeAlias;

            });

        if (procedimento) {

            return procedimento;

        }

    }


    /* =================================================
       3. PROCURA POR APROXIMAÇÃO SEGURA
    ================================================= */

    const candidatos =
        procedimentosBanco.filter(item => {

            const nomeBanco =
                normalizeText(item.nome);

            if (!nomeBanco) {

                return false;

            }

            return (
                nomeBanco.includes(nomeNormalizado) ||
                nomeNormalizado.includes(nomeBanco)
            );

        });


    /*
       Só aceita quando existe UMA possibilidade.
    */

    if (candidatos.length === 1) {

        console.log(
            "Procedimento encontrado por aproximação:",
            nomeHTML,
            "→",
            candidatos[0].nome
        );

        return candidatos[0];

    }


    /* =================================================
       NÃO ENCONTROU
    ================================================= */

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

    if (!supabaseClient) {

        console.error(
            "Supabase não está conectado."
        );

        return;

    }

    try {

        const { data, error } =
            await supabaseClient
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
            "✓ Procedimentos carregados:",
            procedimentosBanco.length
        );


        atualizarPrecosDaPagina();

        atualizarFotosDosProcedimentos();

        ativarBotoesServicos();


    } catch (error) {

        console.error(
            "Erro inesperado ao carregar procedimentos:",
            error
        );

    }

}


/* =====================================================
   ATUALIZAR PREÇOS DA PÁGINA
===================================================== */

function atualizarPrecosDaPagina() {

    const botoes =
        document.querySelectorAll(
            ".add-service"
        );


    botoes.forEach(button => {

        const nomeServico =
            button.dataset.service;

        if (!nomeServico) {

            return;

        }


        const procedimento =
            encontrarProcedimento(
                nomeServico
            );


        if (!procedimento) {

            return;

        }


        const preco =
            Number(procedimento.preco) || 0;


        button.dataset.price =
            preco;


        const card =
            button.closest(
                ".price-card, .simple-card, .spa-content, .service-card, .gallery-card, article, .card"
            );


        if (!card) {

            return;

        }


        const priceElement =
            card.querySelector(".price");


        if (priceElement) {

            priceElement.textContent =
                `R$ ${formatPrice(preco)}`;

        }


        const strong =
            card.querySelector("strong");


        if (
            strong &&
            !strong.closest(".add-service")
        ) {

            strong.textContent =
                `R$ ${formatPrice(preco)}`;

        }


        const spaPrice =
            card.querySelector(".spa-price");


        if (spaPrice) {

            spaPrice.textContent =
                `R$ ${formatPrice(preco)}`;

        }

    });

}


/* =====================================================
   ATUALIZAR FOTOS DOS PROCEDIMENTOS
===================================================== */

function atualizarFotosDosProcedimentos() {

    if (!supabaseClient) {

        console.error(
            "Não foi possível atualizar as fotos porque o Supabase não está conectado."
        );

        return;

    }


    console.log(
        "Verificando fotos dos procedimentos..."
    );


    procedimentosBanco.forEach(procedimento => {

        if (!procedimento.foto) {

            return;

        }


        const nomeProcedimento =
            procedimento.nome;


        const nomeNormalizado =
            normalizeText(
                nomeProcedimento
            );


        const { data } =
            supabaseClient
                .storage
                .from("procedimento")
                .getPublicUrl(
                    procedimento.foto
                );


        if (
            !data ||
            !data.publicUrl
        ) {

            console.warn(
                "Não foi possível gerar a URL da foto:",
                procedimento
            );

            return;

        }


        const fotoURL =
            data.publicUrl;


        console.log(
            `Foto encontrada: ${nomeProcedimento}`,
            fotoURL
        );


        /* =================================================
           CÍLIOS
        ================================================= */

        if (
            nomeNormalizado === "volume light" ||
            nomeNormalizado === "volume brasileiro" ||
            nomeNormalizado === "volume egipcio"
        ) {

            const imagens =
                document.querySelectorAll(
                    "#cilios .service-gallery img"
                );


            imagens.forEach(imagem => {

                const alt =
                    normalizeText(
                        imagem.alt
                    );


                if (
                    nomeNormalizado === "volume light" &&
                    alt.includes("volume light")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }


                if (
                    nomeNormalizado === "volume brasileiro" &&
                    alt.includes("volume brasileiro")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }


                if (
                    nomeNormalizado === "volume egipcio" &&
                    alt.includes("volume egipcio")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }

            });

        }


        /* =================================================
           UNHAS
        ================================================= */

        if (
            nomeNormalizado === "alongamento quadrada" ||
            nomeNormalizado === "alongamento almond" ||
            nomeNormalizado === "alongamento stiletto"
        ) {

            const imagens =
                document.querySelectorAll(
                    "#unhas .service-gallery img"
                );


            imagens.forEach(imagem => {

                const alt =
                    normalizeText(
                        imagem.alt
                    );


                if (
                    nomeNormalizado === "alongamento quadrada" &&
                    alt.includes("formato quadrado")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }


                if (
                    nomeNormalizado === "alongamento almond" &&
                    alt.includes("formato almond")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }


                if (
                    nomeNormalizado === "alongamento stiletto" &&
                    alt.includes("formato stiletto")
                ) {

                    imagem.src =
                        fotoURL;

                    imagem.dataset.supabaseFoto =
                        "true";

                }

            });

        }


        /* =================================================
           SPA DOS PÉS
        ================================================= */

        if (
            nomeNormalizado === "spa dos pes"
        ) {

            const imagem =
                document.querySelector(
                    "#spa .spa-image img"
                );


            if (imagem) {

                imagem.src =
                    fotoURL;

                imagem.dataset.supabaseFoto =
                    "true";

            }

        }

    });

}


/* =====================================================
   ATIVAR BOTÕES DOS SERVIÇOS
===================================================== */

function ativarBotoesServicos() {

    const botoes =
        document.querySelectorAll(
            ".add-service"
        );


    botoes.forEach(button => {

        if (
            button.dataset.eventoAtivo === "true"
        ) {

            return;

        }


        button.dataset.eventoAtivo =
            "true";


        button.addEventListener(
            "click",
            () => {

                const nomeServico =
                    button.dataset.service;


                if (!nomeServico) {

                    return;

                }


                const procedimento =
                    encontrarProcedimento(
                        nomeServico
                    );


                if (!procedimento) {

                    console.warn(
                        "Não foi possível adicionar:",
                        nomeServico
                    );

                    return;

                }


                const preco =
                    Number(
                        procedimento.preco
                    ) || 0;


                const existente =
                    cart.find(item => {

                        return normalizeText(
                            item.service
                        ) ===
                        normalizeText(
                            procedimento.nome
                        );

                    });


                if (existente) {

                    existente.quantity =
                        (existente.quantity || 1) + 1;


                } else {

                    cart.push({

                        service:
                            procedimento.nome,

                        price:
                            preco,

                        quantity:
                            1,

                        maintenance:
                            button.dataset.maintenance || ""

                    });

                }


                renderCart();


                const textoOriginal =
                    button.textContent;


                button.textContent =
                    "Adicionado ✓";


                button.classList.add(
                    "added"
                );


                setTimeout(() => {

                    button.textContent =
                        textoOriginal;

                    button.classList.remove(
                        "added"
                    );

                }, 1200);

            }
        );

    });

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

        cartItems.innerHTML = "";

    }


    if (cart.length === 0) {

        if (cartItems) {

            cartItems.innerHTML =
                "<p>Nenhum serviço selecionado.</p>";

        }

        if (cartEmpty) {

            cartEmpty.style.display =
                "block";

        }

    } else {

        if (cartEmpty) {

            cartEmpty.style.display =
                "none";

        }


        if (cartItems) {

            cart.forEach((item, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "cart-item";


                const quantidade =
                    item.quantity || 1;


                div.innerHTML = `

                    <div class="cart-item-top">

                        <div>

                            <h4>
                                ${item.service}
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
                            R$ ${formatPrice(
                                Number(item.price) *
                                quantidade
                            )}
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

            });

        }

    }


    const total =
        cart.reduce(
            (sum, item) => {

                return sum +
                    (
                        Number(item.price || 0) *
                        (item.quantity || 1)
                    );

            },
            0
        );


    const quantidadeTotal =
        cart.reduce(
            (sum, item) => {

                return sum +
                    (item.quantity || 1);

            },
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            `R$ ${formatPrice(total)}`;

    }


    if (cartCount) {

        cartCount.textContent =
            quantidadeTotal;

    }


    document
        .querySelectorAll(
            ".cart-item-remove"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
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


/* =====================================================
   LIMPAR CARRINHO
===================================================== */

const clearCartButton =
    document.getElementById(
        "clear-cart"
    );


if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        () => {

            cart = [];

            renderCart();

        }
    );

}


/* =====================================================
   MANUTENÇÃO DOS CÍLIOS
===================================================== */

document
    .querySelectorAll(
        "[data-maintenance]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const maintenance =
                    button.dataset.maintenance;


                document
                    .querySelectorAll(
                        "[data-maintenance]"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                const selectedService =
                    button.closest(
                        ".service-card, .price-card, article, .card"
                    );


                if (selectedService) {

                    const addButton =
                        selectedService.querySelector(
                            ".add-service"
                        );


                    if (addButton) {

                        addButton.dataset.maintenance =
                            maintenance;

                    }

                }

            }
        );

    });


/* =====================================================
   CONTROLE DO AGENDAMENTO
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


const openCartButtons =
    document.querySelectorAll(
        ".open-cart"
    );


const closeCartButtons =
    document.querySelectorAll(
        ".close-cart"
    );


/* =====================================================
   ABRIR AGENDAMENTO
===================================================== */

function abrirAgendamento() {

    console.log(
        "Abrindo agendamento..."
    );


    if (!cartDrawer) {

        console.error(
            "ERRO: #cart-drawer não encontrado."
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
   BOTÃO DO CARRINHO
===================================================== */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        abrirAgendamento
    );

}


/* =====================================================
   BOTÕES "AGENDAR HORÁRIO"
===================================================== */

openCartButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            abrirAgendamento();

        }
    );

});


/* =====================================================
   BOTÃO X
===================================================== */

if (cartClose) {

    cartClose.addEventListener(
        "click",
        fecharAgendamento
    );

}


/* =====================================================
   BOTÕES DE FECHAR
===================================================== */

closeCartButtons.forEach(button => {

    button.addEventListener(
        "click",
        fecharAgendamento
    );

});


/* =====================================================
   CLICAR NO FUNDO
===================================================== */

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        fecharAgendamento
    );

}


/* =====================================================
   TECLA ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            fecharAgendamento();

        }

    }
);


/* =====================================================
   BOTÃO WHATSAPP
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
   ENVIAR AGENDAMENTO PELO WHATSAPP
===================================================== */

function enviarAgendamentoWhatsApp() {

    if (
        !cart ||
        cart.length === 0
    ) {

        alert(
            "Selecione pelo menos um procedimento antes de agendar."
        );

        return;

    }


    /* =================================================
       DADOS DO CLIENTE
    ================================================= */

    const nome =
        document
            .getElementById(
                "client-name"
            )
            ?.value
            .trim() || "";


    const telefone =
        document
            .getElementById(
                "client-phone"
            )
            ?.value
            .trim() || "";


    const profissional =
        document
            .getElementById(
                "professional"
            )
            ?.value || "";


    const data =
        document
            .getElementById(
                "booking-date"
            )
            ?.value || "";


    const horario =
        document
            .getElementById(
                "booking-time"
            )
            ?.value || "";


    const pagamento =
        document
            .getElementById(
                "payment-method"
            )
            ?.value || "";


    /* =================================================
       VALIDAÇÕES
    ================================================= */

    if (!nome) {

        alert(
            "Informe seu nome."
        );

        return;

    }


    if (!telefone) {

        alert(
            "Informe seu WhatsApp."
        );

        return;

    }


    if (!profissional) {

        alert(
            "Escolha a profissional."
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


    /* =================================================
       PROCEDIMENTOS
    ================================================= */

    let servicesMessage = "";


    cart.forEach(item => {

        const quantidade =
            item.quantity || 1;


        servicesMessage +=
            `\n• ${item.service}`;


        if (quantidade > 1) {

            servicesMessage +=
                ` x${quantidade}`;

        }


        if (item.maintenance) {

            servicesMessage +=
                ` (${item.maintenance})`;

        }


        const valor =
            Number(item.price || 0) *
            quantidade;


        servicesMessage +=
            ` — R$ ${formatPrice(valor)}`;

    });


    /* =================================================
       TOTAL
    ================================================= */

    const total =
        cart.reduce(
            (sum, item) => {

                return sum +
                    (
                        Number(item.price || 0) *
                        (item.quantity || 1)
                    );

            },
            0
        );


    /* =================================================
       DATA
    ================================================= */

    const dataFormatada =
        data
            .split("-")
            .reverse()
            .join("/");


    /* =================================================
       MENSAGEM
    ================================================= */

    let message =
        "Olá! Gostaria de solicitar um agendamento.\n\n";


    message +=
        `*Nome:* ${nome}\n`;


    message +=
        `*WhatsApp:* ${telefone}\n`;


    message +=
        `*Profissional:* ${profissional}\n`;


    message +=
        `*Data:* ${dataFormatada}\n`;


    message +=
        `*Horário:* ${horario}\n`;


    message +=
        `*Forma de pagamento:* ${pagamento}\n`;


    message +=
        `\n*Procedimentos:*${servicesMessage}\n`;


    message +=
        `\n*Total:* R$ ${formatPrice(total)}\n`;


    /* =================================================
       ABRIR WHATSAPP
    ================================================= */

    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   ATUALIZAR LINKS DO WHATSAPP
===================================================== */

document
    .querySelectorAll(
        'a[href*="wa.me"]'
    )
    .forEach(link => {

        const href =
            link.getAttribute(
                "href"
            );


        if (!href) {

            return;

        }


        if (
            href.includes(
                "wa.me/"
            )
        ) {

            const novaURL =
                href.replace(
                    /wa\.me\/\d+/,
                    `wa.me/${WHATSAPP_NUMBER}`
                );


            link.setAttribute(
                "href",
                novaURL
            );

        }

    });


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
            event => {

                const targetId =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                /*
                   Não impedir o funcionamento
                   dos botões que abrem o carrinho.
                */

                if (
                    link.classList.contains(
                        "open-cart"
                    )
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth"

                });

            }
        );

    });


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

renderCart();


