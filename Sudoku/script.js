
class Grid {
	computeRelative(_cell)
	{
		const sectorX = Math.ceil(_cell.x/3)
		const sectorY = Math.ceil(_cell.y/3)
		const replacement = {1: 1, 2: 4, 3: 7}

		this.eachCell((cell) => {
			if (cell.x === _cell.x || cell.y === _cell.y || this.getSector(cell) === this.getSector(_cell))
				cell.removeAvailableValue(_cell.value)
		})
	}

	getSector(cell)
	{
		const x = Math.ceil(cell.x/3)
		const y = Math.ceil(cell.y/3)

		return 3*y + x - 3
	}

	eachCell(callback, isEmptyTest)
	{
		isEmptyTest = isEmptyTest ?? true
		for (let i = 1; i <= 9*9; i++) {
			const cell = new Cell(i)
			if (cell.isEmpty || !isEmptyTest) {
				if (callback(cell) === false)
					return cell
			}
		}
		return false
	}

	getCell()
	{
		let sorted = [[],[],[],[],[],[],[],[],[]]
		let result = this.eachCell((cell) => {
			if (cell.conflict) {
				this.reset()
				return false
			}
			sorted[cell.availableValues.length-1].push(cell)
		})
		sorted = sorted.filter(function (el) {
			return el.length > 0
		})
		if (!sorted[0])
			return false

		return sorted[0][0]
	}

	step ()
	{
		console.log('step')
		const cell = this.getCell()
		if (!cell)
			return false
		cell.setRandomValue()
		this.computeRelative(cell)
		return true
	}

	reset() {
		this.eachCell(function (cell) {
			cell.reset()
		}, false)
		run()
	}
}


const grid = new Grid

function run()
{
	let loop = setInterval(() => {
		if (!grid.step())
			clearInterval(loop)
	}, 10)
}


for (let cell of document.querySelectorAll('.cell')) {
	cell.addEventListener('click', function (e) {
		e.target.classList.add('active')
	})
}




document.querySelector('button#start').addEventListener('click', function () {
	grid.reset()
	run()
})

