
class Cell {
	constructor(a, b) {
		if (!b) {
			this.x = a % 9 == 0 ? 9 : a % 9
			this.y = 1 + (a - this.x)/9
		} else {
			this.x = a
			this.y = b
		}

		this.element = document.querySelector(`.cell[x="${this.x}"][y="${this.y}"]`)

		Object.defineProperty(this, 'availableValues', {set: this.setAvailableValues, get: this.getAvailableValues})
		Object.defineProperty(this, 'isEmpty', {get: this.isEmpty})
		Object.defineProperty(this, 'conflict', {get: this.conflict})
		Object.defineProperty(this, 'value', {set: this.setValue, get: this.getValue})
	}

	conflict()
	{
		return this.isEmpty && this.availableValues.length < 1
	}

	setAvailableValues(newValue)
	{
		this.element.attributes.available.value = newValue.join(',')
	}

	getAvailableValues()
	{
		return this.element.attributes.available.value.split(',').filter((el) => {
			return el
		})
	}

	isEmpty()
	{
		return this.value ? false : true
	}

	setValue(value) {
		this.availableValues = []
		this.element.textContent = value
	}

	getValue()
	{
		return this.element.textContent
	}

	removeAvailableValue(value)
	{
		let availableValues = this.availableValues
		const index = availableValues.indexOf(value + '')
		if (index !== -1)
			availableValues.splice(index, 1)
		this.availableValues = availableValues
		return this.availableValues.length
	}

	setRandomValue()
	{
		const random = Math.floor(Math.random() * (this.availableValues.length))
		this.value = this.availableValues[random]
	}

	reset()
	{
		this.value = ''
		this.availableValues = [1,2,3,4,5,6,7,8,9]
	}
}