function openLinkk(linkk) {
         window.open(linkk,"_blank");
}

document.addEventListener('DOMContentLoaded', async function () {
    
    const bt1 = document.getElementsByClassName('botoes')[0];
    const bt2 = document.getElementsByClassName('botoes')[1];
    const divGeral = document.getElementById('principal');
    const containerImg = document.createElement('div');
    const pagina = document.getElementById("paginador");
    const modal = document.querySelector(".modal");
    const popup = document.querySelector(".popup");
    let modalaberto = 0;
    
    containerImg.classList.add('containerImagens');
    divGeral.appendChild(containerImg);
    
    // páginas e etc
    let atualPagina = 1;
    const fotosPorPagina = 3;
    let todasFotos = [];
    let totalPaginas = 1;
    

    function handleButtonHover(button, isActive) {
        button.addEventListener('mouseenter', () => {
            button.classList.add('botoesHover');
        });
        button.addEventListener('mouseleave', () => {
            if (isActive()) {
                button.classList.remove('botoesHover');
            }
        });
    }

    //só funciona se tá dentro do limite de paginas
    handleButtonHover(bt1, () => atualPagina > 1); 
    handleButtonHover(bt2, () => atualPagina < totalPaginas); 

    // processa dados do CSV
    try {
        const response = await fetch('src/colecao.csv');
        if (!response.ok) throw new Error(`erro ao carregar CSV: ${response.status} AAAAAAAAAAAAA O QUE TÁ DANDO ERRADO PORRAAAAA`);

        const csvData = await response.text();
        const linhas = csvData.split('\n').filter(linha => linha.trim() !== '');
        const cabecalhos = linhas[0].split(';');
        // não faço ideia do que isso faz, só sei que transforma os dados do csv em array de objetos, obrigado stackoverflow
        todasFotos = linhas.slice(1).map(linha => {
            const valores = linha.split(';');
            return cabecalhos.reduce((obj, cabecalho, index) => {
                obj[cabecalho.trim()] = valores[index]?.trim();
                return obj;
            }, {});
        });

        totalPaginas = Math.ceil(todasFotos.length / fotosPorPagina);
        updateCSSBotoes();
        mostrarFotosPaginaAtual();

    } catch (error) {
        console.error('Dados errados:', error," Fuck");
        const erroDiv = document.createElement('div');
        erroDiv.textContent = 'HELPPPPPPPP.';
        erroDiv.style.color = 'red';
        erroDiv.style.padding = '20px';
        erroDiv.style.fontSize = "69px";
        divGeral.appendChild(erroDiv);
    }

    // prox e prev pagina
    function nextPage() {
        if (atualPagina < totalPaginas) {
            atualPagina++;
            mostrarFotosPaginaAtual();
            updateCSSBotoes();
            mostrarPaginaAtual();
        }
    }
    function prevPage() {
        if (atualPagina > 1) {
            atualPagina--;
            mostrarFotosPaginaAtual();
            updateCSSBotoes();
            mostrarPaginaAtual();
        }
    }

    function mostrarFotosPaginaAtual() {
        containerImg.innerHTML = ''; //única utilizade do innerHTML segundo certos alguéns


        const startIndex = (atualPagina - 1) * fotosPorPagina;
        // ultimo index ou vai ser a última foto da pagina ou ultima foto da lista, o que for menor
        const endIndex = Math.min(startIndex + fotosPorPagina, todasFotos.length);

        for (let i = startIndex; i < endIndex; i++) {
            const fotoAtual = todasFotos[i];
            if (!fotoAtual.imagem) continue;

            // container individual
            const card = document.createElement('div');
            card.classList.add('containerIndiv');

            const img = document.createElement('img');
            img.src = `src/imgs/${fotoAtual.imagem}`;
            img.alt = `Foto: ${fotoAtual.titulo}.`;
            img.classList.add('imagem');
            img.addEventListener('click', (event) => {
                abrirModal(fotoAtual.titulo,fotoAtual.descricao,fotoAtual.motivo);
            });

            card.appendChild(img);
            containerImg.appendChild(card);
        }
    }

    function abrirModal(title,description,reason) {
        modalaberto = 1;
        popup.innerHTML = `
        <h2>${title}</h2>
        <p id="descricao">${description}</p>
        <p><strong>Motivo: </strong>${reason}</p>
        <div id="botoespopup">
            <button class="botoes" id="close">Fechar</button>
        </div>
        `;
        popup.style = `
top:50%;
animation-name: popin;
animation-duration: 0.6s;
`;
        
        //tenho que lembrar de adicionoar o event listener DEPOIS de criar o botão
        document.getElementById('close').addEventListener('click', fecharModal);
        
        //configurar listeners apenas uma vez
        if (!modal._listenersConfigured) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    fecharModal();
                }
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('modalAberto')) {
                    setTimeout(fecharModal(), 1);
                }
            });
            
            modal._listenersConfigured = true;
        }
        
        modal.classList.add('modalAberto');
    }

    function fecharModal() {
        popup.style = `
top:150%;
animation-name: popout;
animation-duration: 0.7s;
`;
setTimeout(() => {
modal.classList.remove('modalAberto'); 
modalaberto = 0;
}, 500)
    }

    function updateCSSBotoes() {
        // prev
        if (atualPagina <= 1) {
            bt1.classList.add('botoesHover');
            bt1.style.opacity = '0.5';
            bt1.style.cursor = 'not-allowed';
        } else {
            bt1.classList.remove('botoesHover');
            bt1.style.opacity = '1';
            bt1.style.cursor = 'pointer';
        }

        // next
        if (atualPagina >= totalPaginas) {
            bt2.classList.add('botoesHover');
            bt2.style.opacity = '0.5';
            bt2.style.cursor = 'not-allowed';
        } else {
            bt2.classList.remove('botoesHover');
            bt2.style.opacity = '1';
            bt2.style.cursor = 'pointer';
        }
    }

    function mostrarPaginaAtual() {
        pagina.innerHTML = "";
        pagina.innerText = `página ${atualPagina}`;
        containerImg.insertBefore(pagina);
    }

    
    bt2.addEventListener('click', nextPage);
    bt1.addEventListener('click', prevPage);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' && modalaberto === 0 && atualPagina < totalPaginas) {
            nextPage();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && modalaberto === 0 && atualPagina > 1) {
            prevPage();
        }
    });

});