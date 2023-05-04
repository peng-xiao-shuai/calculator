export const KEYS = ['AC', '＋/－', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=']
// 乘除正则
export const symbolReg1 = new RegExp(`^[${KEYS[4 - 1]}${KEYS[2 * 4 - 1]}]$`)
// 加减正则
export const symbolReg2 = new RegExp(`^[\\${KEYS[3 * 4 - 1]}${KEYS[4 * 4 - 1]}]$`)
// 加减乘除正则
export const symbolReg3 = new RegExp(`^[${KEYS[4 - 1]}${KEYS[2 * 4 - 1]}\\${KEYS[3 * 4 - 1]}${KEYS[4 * 4 - 1]}]$`)
// 计算结果
export const operation = (num1, num2, symbol) => {
	let num = undefined
	switch (symbol) {
		case KEYS[4 - 1]:
			num = num1 / num2
			break;
		case KEYS[2 * 4 - 1]:
			num = num1 * num2
			break;
		case KEYS[3 * 4 - 1]:
			num = num1 - num2
			break;
		case KEYS[4 * 4 - 1]:
			num = Number(num1) + Number(num2)
			break;
	}
	
	// 为8主要是ios最大为8为小数
	return String(parseFloat(Number(num).toPrecision(8)))
}

// 计算总和值
export const computeCount = (computes) => {
	let cacheIndex = undefined
	let index = undefined
	for (let i in computes) {
		if (symbolReg1.test(computes[i])) {
			index = i
			break
		} else if (!cacheIndex && symbolReg2.test(computes[i])) {
			cacheIndex = i
		}
	}
	
	index = Number(index || cacheIndex)
	// console.log(index, 'index');
	computes.splice(index - 1, 3, operation(computes[index - 1], computes[index + 1], computes[index]))
	
	if (computes.length > 2) {
		return computeCount(computes)
	} else {
		return computes[0]
	}
}