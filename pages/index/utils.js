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
		
		return String(num)
	}