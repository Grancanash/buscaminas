# JS Entrega de proyecto Javascript

# Propuesta 1: Juego de Buscaminas (Minesweeper)

## Objetivo del ejercicio
- Practicar la generación y manipulación dinámica del DOM.
- Utilizar lógica más avanzada para manejar estados de celdas (abiertas, cerradas, banderas, minas).
- Implementar funciones recursivas o de recorrido para descubrir espacios vacíos automáticamente.
- *(Opcional)* Usar `localStorage` para guardar el mejor tiempo del jugador.

## Ejercicio

### 1. Generar el Tablero
- Pide al usuario que elija el tamaño del tablero (ej. 8x8, 16x16) y la cantidad de minas.
- Crea dinámicamente una cuadrícula con celdas HTML.
- Ubica las minas de manera aleatoria.

### 2. Lógica del Juego
- Al hacer clic en una celda:
  - Si contiene una mina, mostrar un mensaje de “Game Over” y revelar todas las minas.
  - Si no contiene mina, revela el número de minas adyacentes.
  - Si es 0 (celda vacía), revela automáticamente todas las celdas adyacentes (y así sucesivamente) hasta topar con celdas que tengan un número mayor que 0.
- Al hacer clic derecho en una celda, se coloca o quita una bandera (para marcar que hay una mina).

### 3. Sistema de Victoria
- El juego finaliza con éxito si el usuario descubre todas las celdas sin mina.
- Muestra un mensaje de felicitación y el tiempo total de juego.

### 4. *(Opcional)* Persistencia con localStorage
- Guarda el mejor tiempo para un tamaño de tablero determinado.
- Si el usuario gana la partida en menor tiempo, actualiza ese valor.

### 5. Extras (ideas de mejora)
- Añadir un contador de minas.
