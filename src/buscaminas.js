import { Timer } from './utils';

export class Buscaminas {
    #grid;
    #totalMines;
    #remainingMines;
    #clickedCell;
    #timer;
    #clickUpTimer;
    #display;

    constructor() {
        // Inicialización del cronómetro
        this.#timer = new Timer("timer-display");

        // Botón reinicio de récords
        this.handleResetButton();

        // Mostrar instrucciones
        this.showInstructions().then(() => {
            // Mostrar prompt de dificultad
            this.promptGridSize()
                .then(event => {
                    this.initListeners();
                })
        });
    }

    showInstructions = () => {
        // Mostrar modal de instrucciones
        return new Promise((resolve) => {
            const idModal = 'modal-instructions'
            this.showModal(idModal)
            document.getElementById('btn-accept-intrutions').addEventListener('click', () => {
                this.hideModal(idModal);
                resolve();
            })
        })
    }

    handleResetButton = () => {
        // Reinicio de récords
        document.querySelector('.btn-reset').addEventListener('click', () => {
            localStorage.removeItem('buscaminas_records');
            this.updateRecords();
        })
    }

    promptGridSize = () => {
        // Modal para elegir nivel de dificultad
        this.showModal('prompt-difficult');
        return new Promise(resolve => {
            for (const btn of document.getElementsByClassName('btn-difficult')) {
                btn.addEventListener('click', (event) => {
                    const level = parseInt(event.target.id.split('btn-difficult-')[1]);
                    this.hideModal('prompt-difficult');
                    this.initGrid(level);
                    resolve();
                });
            }
        })
    }

    hideModal = (idModal) => {
        // Ocultar modal
        const box = document.getElementById(idModal);
        box.style.opacity = 0;
        box.addEventListener("transitionend", () => {
            box.style.display = "none";
        }, { once: true });
    }

    showModal = (idModal) => {
        // Mostrar modal
        const box = document.getElementById(idModal);
        const div = box.querySelector('.box>div');
        if (div) {
            div.scrollTop = 0;
        }
        box.style.display = "flex";
        setTimeout(() => {
            box.style.opacity = 1;
        }, 100);
    }

    initGrid = (level) => {
        // Iniciar timer
        if (this.#timer.startTime) this.#timer.reset();

        // Mostrar records
        this.updateRecords();

        const grid = document.getElementById('grid');
        grid.innerText = '';
        this.#grid = []

        // Detectamos el dispositivo para el aspecto responsive
        if (window.innerWidth < 768) {
            this.#display = 'm'
        } else {
            this.#display = 'd'
        }

        let row, column = 0;
        switch (level) {
            case 1:
                grid.classList.add('dificult-1');
                row = column = 9;
                this.#totalMines = 10;
                break;
            case 2:
                grid.classList.add('dificult-2');
                row = this.#display === 'd' ? 16 : 32;
                column = this.#display === 'd' ? 16 : 8;
                this.#totalMines = 40;
                break;
            case 3:
                grid.classList.add('dificult-3');
                row = this.#display === 'd' ? 16 : 48;
                column = this.#display === 'd' ? 30 : 10;
                this.#totalMines = 99;
                break;
        }

        grid.style.gridTemplateColumns = `repeat(${column}, 1fr)`;

        for (let n = 0; n < (row * column); n++) {
            const div = document.createElement('div');
            div.classList.add('cell');
            grid.appendChild(div);
        }

        // Si tipo de dispositivo es tablet, se tiene que ajustar el ancho del grid 
        // al ancho del dispositivo en el modo difícil
        if ((this.#display === 'd' && window.innerWidth < 1200) && level === 3) {
            document.getElementById('grid').style.display = 'grid';
            for (const div of document.querySelectorAll('.cell')) {
                div.style.width = 'inherit';
                div.style.height = 'inherit';
            }
        }

        // Obtener array de minas aleatorias
        const arrMines = this.randomMines(this.#totalMines, row * column);
        let counter = 1;

        // Se inicializa el #grid
        for (let f = 1; f <= row; f++) {
            for (let c = 1; c <= column; c++) {
                this.#grid.push({ id: counter, row: f, column: c, containMine: arrMines.includes(counter - 1), flag: false });
                counter++;
            }
        }

        this.#remainingMines = this.#totalMines;
        document.querySelector('#mines span').innerText = this.#remainingMines;

        // // --------------------------- ELIMINAR
        // // muestra las minas
        // let n = 0;
        // for (let div of document.querySelectorAll('#grid>div')) {
        //     if (this.#grid[n].containMine)
        //         div.textContent = '*';
        //     n++;
        // }
    }

    randomMines = (totalMines, totalCells) => {
        // Calcular minas aleatorias
        const numeros = Array.from({ length: totalCells }, (_, i) => i);
        // Barajar con algoritmo de Fisher–Yates
        for (let i = numeros.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
        }
        return numeros.slice(0, totalMines);
    }

    getIndexCell = (cell) => {
        // Obtener el índice de la celda en el grid del DOM
        const board = document.getElementById('grid');
        const index = Array.from(board.children).indexOf(cell);
        return index;
    }

    checkClick = () => {
        // Chequeo de la pulsación mouseDown / touchDown (Ratón / dedo)

        // Iniciar Timer
        if (!this.#timer.startTime) this.#timer.start();

        // Checkear la celda pulsada
        const index = this.getIndexCell(this.#clickedCell);
        const row = parseInt(this.#grid[index].row);
        const column = parseInt(this.#grid[index].column);

        const selectedCell = this.#grid.filter(cell => {
            if (cell.row === row && cell.column === column) return cell;
        })

        if (selectedCell[0].disabled) return;

        // Si hay bandera o interrogante, no se ejecuta la lógica
        if (selectedCell[0].flag === true || selectedCell[0].mark === true) {
            return;
        }

        // GAME OVER. Si hay una mina se finaliza el juego
        if (selectedCell[0].containMine) {
            this.displayEndGame(0);
            return;
        }

        // Gestionar celdas vacías (sin minas alrededor)
        const minesAround = this.minesAround(row, column);
        if (!minesAround) {
            this.#grid[index].emptyChecked = true;
            this.clearEmptyCells(this.#grid[index]);
        }

        // Lógica que modifica el dom de la celda pulsada
        this.updateCellDesign(selectedCell[0], minesAround);
        this.#clickedCell = null;

        // Comprobar fin del juego.
        const totalCellDisabled = this.#grid.reduce((acc, cell) => acc = acc + (cell.disabled ? 1 : 0), 0)
        if ((totalCellDisabled + this.#totalMines) === this.#grid.length) {
            this.displayEndGame(1);
        }
    }

    // Lógica de la finalización del juego
    displayEndGame = (type) => {
        // Si el tipo es 1 gana el juego, si no, pierde
        // Añadir texto de información
        this.#timer.pause();

        document.querySelector('#result h3').innerText = type === 1 ? '¡Enhorabuena!' : '¡Has fallado!';
        document.querySelector('#result h3').style.color = type === 1 ? 'green' : 'red';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (type === 1) {
            // Comprobar récord
            const gridLength = 'cells_' + this.#grid.length;
            // const timer = this.#timer.getTimer();
            const totalTime = this.#timer.totalTime;

            let records = JSON.parse(localStorage.getItem('buscaminas_records'));
            if (records) {
                if (records[gridLength]) {
                    if (totalTime < records[gridLength]) {
                        records[gridLength] = totalTime;
                        this.updateRecords(records);
                    }
                } else {
                    records[gridLength] = totalTime;
                    this.updateRecords(records);
                }
            } else {
                records = {};
                records[gridLength] = totalTime;
                this.updateRecords(records);
            }

            localStorage.setItem('buscaminas_records', JSON.stringify(records));

        } else {
            // Mostrar minas
            for (const cell of this.#grid) {
                cell.disabled = true;
                document.querySelector(`.cell:nth-of-type(${cell.id})`).classList.add('disabled');
                if (cell.containMine) {
                    document.querySelector(`.cell:nth-of-type(${cell.id})`).classList.add('mine');
                }
            }
        }

        // Animar resultado
        document.getElementById('info').style.height = '50px';
        document.getElementById('result').style.height = '110px';
        document.getElementById('mines').style.height = '0';

        // Botón "Nueva partida"
        document.querySelector('#result button').addEventListener('click', () => {
            // Ocultar resultado del juego y abrir ventana de comenzar nuevo juego
            document.getElementById('console').style.height = 'auto';
            document.getElementById('info').style.height = '100px';
            document.getElementById('result').style.height = '0';
            document.getElementById('mines').style.height = '100%';
            document.getElementById('result').addEventListener("transitionend", () => {
                // document.getElementById('console').style.gap = 0;
            }, { once: true });

            this.showModal('prompt-difficult');
        })
    }

    // Actualziar récords en la consola
    updateRecords = (newRecord) => {
        let records = newRecord ? newRecord : JSON.parse(localStorage.getItem('buscaminas_records'));
        if (records) {
            if (records.cells_81) {
                document.querySelector('#records > p:nth-of-type(2) > span:last-of-type').innerText = this.#timer.format(records.cells_81);
            }
            if (records.cells_256) {
                document.querySelector('#records > p:nth-of-type(3) > span:last-of-type').innerText = this.#timer.format(records.cells_256);
            }
            if (records.cells_480) {
                document.querySelector('#records > p:nth-of-type(4) > span:last-of-type').innerText = this.#timer.format(records.cells_480);
            }
        } else {
            document.querySelector('#records > p:nth-of-type(2) > span:last-of-type').innerText = '00:00:00';
            document.querySelector('#records > p:nth-of-type(3) > span:last-of-type').innerText = '00:00:00';
            document.querySelector('#records > p:nth-of-type(4) > span:last-of-type').innerText = '00:00:00';
        }
    }

    // Función que devuelve la cantidad de minas que rodea una celda
    minesAround = (row, column) => {
        const rows = [row - 1, row, row + 1];
        const columns = [column - 1, column, column + 1];

        return this.#grid.reduce((acumulator, cell) => {
            if (rows.includes(cell.row) && columns.includes(cell.column) && cell.containMine) {
                acumulator++;
            }
            return acumulator;
        }, 0);
    }

    // Función que abre espacios libres cuando se pincha sobre una celda libre (sin minas que la rodee)
    clearEmptyCells = (cell) => {
        // Se itera por las 8 celdas que rodean la celda pulsada
        for (let r = cell.row - 1; r <= cell.row + 1; r++) {
            for (let c = cell.column - 1; c <= cell.column + 1; c++) {
                // Se obtiene del #grid la nueva celda iterada
                const newCell = this.#grid.filter(cell => cell.row === r && cell.column === c)[0];
                // Se obtiene el total de minas que hay alrededor de la celda iterada
                const minesAround = this.minesAround(r, c);
                if (newCell) {
                    // Lógica que modifica el dom de la celda iterada
                    this.updateCellDesign(newCell, minesAround);

                    // Si la celda iterada está limpia (no la rodea ninguna mina) se vuelve a llamar
                    // recursivamente a la función clearEmptyCells()
                    if (!minesAround && !newCell.emptyChecked) {
                        newCell.emptyChecked = true;
                        this.clearEmptyCells(newCell);
                    }
                }
            }
        }
    }

    // Lógica que redibuja y reconfigura la celda (añade número, lo colorea, cambia el color de fondo, etc)
    updateCellDesign = (newCell, minesAround) => {
        const index = newCell.id;
        let div = document.querySelectorAll(`#grid>div.cell:nth-of-type(${index})`)[0];

        // Se escribe en la celda  el número de minas que rodea la celda
        div.textContent = minesAround ? minesAround : '';

        // Se colorea el número en función de su valor
        const colors = {
            1: "blue",
            2: "green",
            3: "red",
            4: "brown",
            5: "navy",
            6: "purple",
            7: "purple",
            8: "purple",
        };
        div.style.color = colors[minesAround];

        // Se elimina bandera de la celda en caso de haberla
        if (newCell.flag || newCell.mark) {
            div.classList.remove('flag');
            div.classList.remove('mark');
            newCell.flag = false;
            newCell.mark = false;
            this.#remainingMines ++;
            document.querySelector('#mines span').innerText = this.#remainingMines;
        }

        // desactiva celda (Se pinta de blanco)
        div.classList.add('disabled');
        newCell.disabled = true;
    }

    // Lógica que gestiona el uso de banderas
    fixFlag = (event) => {
        const cell = this.#grid[this.getIndexCell(this.#clickedCell)]
        const flags = this.#grid.reduce((acc, cell) => acc + (cell.flag ? 1 : 0), 0);

        // Se detiene la ejecuión de la lógica de poner banderas si se alcanzó
        // el total de banderas puestas, o la celda está deshabilitada
        if (cell.disabled) {
            this.#clickedCell = null;
            return;
        }

        // Se alternan las clases flag y mark de la celda correspondiente en el DOM
        // flag = bandera
        // mark = interrogante
        // (Si se vuelve a pulsar con botón derecho sobre una bandera, ésta se convierte en interrogante)
        const cellClasses = this.#clickedCell.classList;
        if (cellClasses.contains('flag')) {
            cellClasses.remove('flag');
            cellClasses.remove('disabled');
            cellClasses.add('mark');
            cell.flag = false
            cell.mark = true;
        } else if (cellClasses.contains('mark')) {
            cellClasses.remove('mark');
            cell.mark = false;
        } else if (flags < this.#totalMines) {
            cellClasses.add('flag');
            cellClasses.add('disabled');
            cell.flag = true;
        }

        this.#remainingMines = this.#totalMines - this.#grid.reduce((acc, cell) => acc + (cell.flag ? 1 : 0), 0);

        document.querySelector('#mines span').innerText = this.#remainingMines;
        this.#clickedCell = null;
    }

    // Listeners principales del tablero (MouseDown, MouseUp, ContextMenu)
    initListeners = () => {
        // Listener del botón de instrucciones
        document.getElementById('btn-instrucciones').addEventListener('click', () => {
            this.showModal('modal-instructions');
        })
        // Se elimina el menú contextual al pulsar botón derecho del ratón
        document.addEventListener('contextmenu', event => event.preventDefault());
        // Listener para el ratón/dedo pulsado
        document.addEventListener('pointerdown', event => {
            // Se asegura que se pulse una celda del tablero
            if (!event.target.classList.contains('cell')) return;
            const prevCell = this.#clickedCell;
            this.#clickedCell = event.target;
            if (event.pointerType === "mouse") {
                // lógica pulsación botón ratón
                if (event.button === 0 && !this.#clickedCell.classList.contains('disabled')) {
                    // Pintar la celda pulsada de gris oscuro
                    this.#clickedCell.classList.add('cell-pressed');
                } else if (event.button === 2) { // Click derecho
                    // Dibujar bandera
                    event.preventDefault();
                    this.fixFlag();
                }
            } else if (event.pointerType === 'touch') {
                // lógica pulsación con dedo desde dispositivo móvil
                event.preventDefault();
                this.#clickedCell.classList.add('cell-pressed');
                // Simulación click derecho en móviles con doble touch
                if (this.#clickUpTimer) {
                    this.#clickedCell.classList.remove('cell-pressed');
                    if (this.#clickedCell === prevCell) {
                        // Dibujar bandera
                        this.removeClickupTimeout();
                        this.fixFlag();
                    } else {
                        prevCell.classList.remove('cell-pressed');
                    }
                }
            }
        });

        // Listener para el ratón/dedo liberado
        document.addEventListener('pointerup', event => {
            if (!event.target.type) {
                if (event.pointerType === 'mouse') {
                    // Mouse Up del ratón
                    if (event.button === 0) {
                        if (this.#clickedCell) {
                            this.#clickedCell.classList.remove('cell-pressed');
                            this.checkClick();
                        }
                    }
                } else if (event.pointerType === 'touch') {
                    // Touch Up de dispositivos móviles
                    // Se usa temporizador de 200ms para dar tiempo a un doble touch y dibujar una bandera,
                    // antes de que se descubra la casilla.
                    if (this.#clickedCell) {
                        this.#clickUpTimer = setTimeout(() => {
                            this.removeClickupTimeout();
                            this.checkClick();
                        }, 200)
                    }
                }
            }
        });
    }

    removeClickupTimeout = () => {
        clearTimeout(this.#clickUpTimer);
        this.#clickUpTimer = null;
    }
}


