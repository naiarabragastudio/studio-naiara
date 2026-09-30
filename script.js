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

const menuButton = document.getElementById("menu-button");
const nav = document.getElementById("nav");

if (menuButton && nav) {

    menuButton.addEventListener("click", () => {

        nav.classList.toggle("active");

    });

}


/* =====================================================
   FECHAR MENU AO CLICAR EM LINK
===================================================== */

if (nav) {

    const navLinks = nav.querySelectorAll("a");

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
        .toLowerCase()
        .trim();

}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatPrice(value) {

    const number = Number(value) || 0;

    return number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


/* =====================================================
   ENCONTRAR PROCEDIMENTO NO BANCO
===================================================== */

function encontrarProcedimento(nomeHTML) {

    const nomeNormalizado = normalizeText(nomeHTML);

    const aliases = {

        "volume light": "volume light",

        "volume brasileiro": "volume brasileiro",

        "volume egipcio": "volume egipcio",

        "alongamento quadrado": "alongamento quadrada",

        "alongamento quadrada": "alongamento quadrada",

        "alongamento almond": "alongamento almond",

        "alongamento stiletto": "alongamento stiletto",

        "spa dos pes": "spa dos pes",

        "spa dos pés": "spa dos pes",

        "blindagem": "blindagem",

        "esmaltação": "esmaltação",

        "esmaltação em gel": "esmaltação em gel",

        "manutenção": "manutenção",

        "manutencao": "manutenção",

        "remoção": "remoção",

        "remocao": "remoção",

        "sobrancelhas": "sobrancelhas",

        "design de sobrancelhas": "design de sobrancelhas",

        "depilação": "depilação",

        "depilacao": "depilação"

    };

    const nomeBusca =
        aliases[nomeNormalizado] || nomeNormalizado;

    return procedimentosBanco.find(procedimento => {

        return normalizeText(procedimento.nome) === nomeBusca;

    });

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

        const { data, error } = await supabaseClient
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

        procedimentosBanco = data || [];

        console.log(
            "Procedimentos carregados do Supabase:",
            procedimentosBanco
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

    const botoes = document.querySelectorAll(".add-service");

    botoes.forEach(button => {

        const nomeServico =
            button.dataset.service;

        if (!nomeServico) return;

        const procedimento =
            encontrarProcedimento(nomeServico);

        if (!procedimento) return;

        const preco =
            Number(procedimento.preco) || 0;

        button.dataset.price = preco;

        const card =
            button.closest(
                ".price-card, .simple-card, .spa-content, .service-card, .gallery-card, article, .card"
            );

        if (!card) return;

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
            normalizeText(nomeProcedimento);

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


        /* =====================================================
           CÍLIOS
        ===================================================== */

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

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Volume Light atualizada."
                    );

                }

                if (
                    nomeNormalizado === "volume brasileiro" &&
                    alt.includes("volume brasileiro")
                ) {

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Volume Brasileiro atualizada."
                    );

                }

                if (
                    nomeNormalizado === "volume egipcio" &&
                    alt.includes("volume egipcio")
                ) {

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Volume Egípcio atualizada."
                    );

                }

            });

        }


        /* =====================================================
           UNHAS
        ===================================================== */

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

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Alongamento Quadrado atualizada."
                    );

                }


                if (
                    nomeNormalizado === "alongamento almond" &&
                    alt.includes("formato almond")
                ) {

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Alongamento Almond atualizada."
                    );

                }


                if (
                    nomeNormalizado === "alongamento stiletto" &&
                    alt.includes("formato stiletto")
                ) {

                    imagem.src = fotoURL;
                    imagem.dataset.supabaseFoto = "true";

                    console.log(
                        "✓ Foto do Alongamento Stiletto atualizada."
                    );

                }

            });

        }


        /* =====================================================
           SPA DOS PÉS
        ===================================================== */

        if (
            nomeNormalizado === "spa dos pes"
        ) {

            const imagem =
                document.querySelector(
                    "#spa .spa-image img"
                );

            if (imagem) {

                imagem.src = fotoURL;

                imagem.dataset.supabaseFoto =
                    "true";

                console.log(
                    "✓ Foto do Spa dos Pés atualizada."
                );

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

        button.addEventListener(
            "click",
            () => {

                const nomeServico =
                    button.dataset.service;

                if (!nomeServico) return;

                const procedimento =
                    encontrarProcedimento(
                        nomeServico
                    );

                if (!procedimento) {

                    console.warn(
                        "Procedimento não encontrado:",
                        nomeServico
                    );

                    return;

                }

                const preco =
                    Number(procedimento.preco) || 0;

                const existente =
                    cart.find(item =>
                        normalizeText(
                            item.service
                        ) ===
                        normalizeText(
                            nomeServico
                        )
                    );

                if (existente) {

                    existente.quantity =
                        (existente.quantity || 1) + 1;

                } else {

                    cart.push({

                        service:
                            procedimento.nome,

                        price:
                            preco,

                        quantity: 1

                    });

                }

                renderCart();

            }
        );

    });

}


/* =====================================================
   CARRINHO
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

    if (cartItems) {

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            cartItems.innerHTML =
                "<p>Nenhum serviço selecionado.</p>";

        } else {

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

                    <div>

                        <strong>
                            ${item.service}
                        </strong>

                        ${
                            item.maintenance
                                ? `<small>${item.maintenance}</small>`
                                : ""
                        }

                    </div>

                    <span>
                        R$ ${formatPrice(
                            item.price * quantidade
                        )}
                    </span>

                    <button
                        type="button"
                        class="remove-cart-item"
                        data-index="${index}"
                    >
                        ×
                    </button>

                `;

                cartItems.appendChild(div);

            });

        }

    }

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.price) *
                    (item.quantity || 1)
                ),
            0
        );

    const quantidadeTotal =
        cart.reduce(
            (sum, item) =>
                sum +
                (item.quantity || 1),
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
            ".remove-cart-item"
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
   BOTÕES DE MANUTENÇÃO DE CÍLIOS
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

                if (
                    selectedService
                ) {

                    const addButton =
                        selectedService.querySelector(
                            ".add-service"
                        );

                    if (
                        addButton
                    ) {

                        addButton.dataset.maintenance =
                            maintenance;

                    }

                }

            }
        );

    });


/* =====================================================
   ATUALIZAR BOTÕES DE SERVIÇO COM MANUTENÇÃO
===================================================== */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".add-service"
            );

        if (!button) return;

        const maintenance =
            button.dataset.maintenance;

        if (!maintenance) return;

        const nomeServico =
            button.dataset.service;

        const procedimento =
            encontrarProcedimento(
                nomeServico
            );

        if (!procedimento) return;

        const preco =
            Number(procedimento.preco) || 0;

        const existente =
            cart.find(item =>
                normalizeText(
                    item.service
                ) ===
                normalizeText(
                    nomeServico
                )
            );

        if (existente) {

            existente.maintenance =
                maintenance;

            existente.price =
                preco;

        }

    }
);


/* =====================================================
   FORMULÁRIO DE AGENDAMENTO
===================================================== */

const bookingForm =
    document.getElementById(
        "booking-form"
    );

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            enviarAgendamentoWhatsApp();

        }
    );

}


/* =====================================================
   ENVIAR AGENDAMENTO PELO WHATSAPP
===================================================== */

function enviarAgendamentoWhatsApp() {

    if (cart.length === 0) {

        alert(
            "Selecione pelo menos um procedimento antes de agendar."
        );

        return;

    }

    const nome =
        document.getElementById(
            "name"
        )?.value.trim() || "";

    const telefone =
        document.getElementById(
            "phone"
        )?.value.trim() || "";

    const data =
        document.getElementById(
            "date"
        )?.value || "";

    const horario =
        document.getElementById(
            "time"
        )?.value || "";

    const pagamento =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value ||
        document.getElementById(
            "payment"
        )?.value ||
        "";

    if (!nome) {

        alert(
            "Informe seu nome."
        );

        return;

    }

    if (!telefone) {

        alert(
            "Informe seu telefone."
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

    let servicesMessage = "";

    cart.forEach(item => {

        servicesMessage +=
            `\n• ${item.service}`;

        if (item.maintenance) {

            servicesMessage +=
                ` (${item.maintenance})`;

        }

        servicesMessage +=
            ` — R$ ${formatPrice(item.price)}`;

    });

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price || 0),
            0
        );

    const dataFormatada =
        data.split("-").reverse().join("/");

    let message =
        `Olá! Gostaria de agendar um horário.\n\n`;

    message +=
        `*Nome:* ${nome}\n`;

    message +=
        `*Telefone:* ${telefone}\n`;

    message +=
        `*Data:* ${dataFormatada}\n`;

    message +=
        `*Horário:* ${horario}\n`;

    message +=
        `\n*Procedimentos:*${servicesMessage}\n`;

    message +=
        `\n*Total:* R$ ${formatPrice(total)}\n`;

    if (pagamento) {

        message +=
            `*Forma de pagamento:* ${pagamento}\n`;

    }

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

        if (!href) return;

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

                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) return;

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


// Carrega os procedimentos do Supabase.
// Depois atualiza os preços.
// Depois atualiza as fotos.
// Depois ativa os botões.

carregarProcedimentos();