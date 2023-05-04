<template>
	<view class="content">
		<view class="view">
			<span :class="{lessen: viewValue.length >= 7}">
				{{ formatt(viewValue) }}
			</span>
		</view>
		
		<!-- 按钮 -->
		<view class="btns" @click="handleClick">
			<view v-for="item in btns" :key='item.text' :style="item.style" :class="item.className" :data-text="item.text"></view>
		</view>
	</view>
</template>

<script>
	import { KEYS, symbolReg1, symbolReg2, symbolReg3, operation, computeCount } from './utils';
	// 计算逻辑
	let computes = []
	// 存储最后操作符 0 为操作符，1为值
	let cacheLastSymbol = []
	
	// 乘除运算符次数
	let countSymbol1 = 0
	// 加减
	let countSymbol2 = 0
	
	// 修改状态 0 不需要操作栈，1删除栈中倒数第二个符号自身、上一个以及下一个下标，2删除倒数第一个符号之前的栈，使用viewValue代替
	let editStatus = 0

	// 判断最后一个是否为计算符号
	const isSymbol = () => {
		return symbolReg3.test(computes[computes.length - 1])
	}
	
	/**
	 * 计算逻辑
	 * @param {string} type 0加减 1乘除
	 * @param {number} count 次数
	 * @returns string
	 * */
	const numFun = (type, count) => {
		let num = undefined
		for(let i = 1; i <= count; i++) {
			// 乘除号下标, 3、7下标除、乘
			console.log(computes);
			const index = computes.findIndex(symbol => type === '0' ? symbolReg2.test(symbol) : symbolReg1.test(symbol))
			if (index == -1) return
			// 进行计算
			// 这里可以使用 eval将字符串当做js执行, 需要去判断 *
			if (index === computes.length - 1) { // 如果最后一个是字符而非数字的情况
				computes.splice(index - 1, 2, operation(computes[index - 1], computes[index - 1], computes[index]))
			} else {
				computes.splice(index - 1, 3, operation(computes[index - 1], computes[index + 1], computes[index]))
			}
			
			console.log(computes, 'computes');
			// 等于二说明最后是字符。这里匹配多个操作符时运算, count == 1时，栈中之后存在一个值
			if (isSymbol()) {
				cacheLastSymbol[1] = computes[computes.length - 2]
			}
		}
	}
	
	export default {
		data() {
			return {
				// 渲染值
				viewValue: 0,
				btns: KEYS && KEYS.map(item => {
					let style = {}
					let className = 'default'
					
					// 相同类型的添加 class
					if (symbolReg3.test(item) || item === KEYS[KEYS.length - 1]) {
						className = 'origin'
					}
					if (new RegExp(`${KEYS[0]}|(?=${KEYS[1]})|${KEYS[2]}`).test(item)) {
						className = 'gray'
					}
					
					// 单独区分样式
					if (item === KEYS[KEYS.length - 3]) {
						style.width = 'calc(144rpx * 2 + 100% / 4 / 4)'
						style.justifyContent = 'flex-start'
						style.padding = '0 50rpx'
					}
					if (item === KEYS[1]) {
						style.fontSize = '50rpx'
					}
					if (item === KEYS[0]) {
						style.fontSize = '50rpx'
					}
					
					return {
						text: item,
						style,
						className
					}
				})
			}
		},
		methods: {
			handleClick({ target }) {
				if (target.dataset.text == undefined) return
				
				switch (target.dataset.text) {
					// AC 点击
					case this.btns[0].text:
						this.btns[0].text = KEYS[0]
						this.viewValue = 0
						cacheLastSymbol = []
						countSymbol1 = 0
						countSymbol2 = 0
						computes = []
						break;
					// 加减乘除点击
					case KEYS[4 - 1]:
					case KEYS[2 * 4 - 1]:
					case KEYS[3 * 4 - 1]:
					case KEYS[4 * 4 - 1]:
						// 不能一开始就是符号
						if (computes.length == 0) return
						
						if (isSymbol()) {
							// 改变符号
							computes[computes.length - 1] = target.dataset.text
						} else {
							computes.push(target.dataset.text)
							// 加入统计字符
							if (symbolReg1.test(target.dataset.text)) countSymbol1++
							if (symbolReg2.test(target.dataset.text)) countSymbol2++
						}
						
						if (computes.length > 3) {
							const previousSymbolIndex = computes.length - 3
							// 判断上一个符号是否是乘除 && 当前符号为加减
							if (symbolReg1.test(computes[previousSymbolIndex]) && symbolReg2.test(target.dataset.text)) {
								
								this.viewValue = computeCount([...computes])
								// console.log('上个乘除当前符号加减', this.viewValue);
								editStatus = 2
							}
							// 上个符号和当前符号 一样的类型
							if (
								(symbolReg1.test(computes[previousSymbolIndex]) && symbolReg1.test(target.dataset.text)) ||
								(symbolReg2.test(computes[previousSymbolIndex]) && symbolReg2.test(target.dataset.text))
							) {
								// console.log('符号相同');
								this.viewValue = operation(computes[previousSymbolIndex - 1], computes[previousSymbolIndex + 1], computes[previousSymbolIndex])
								editStatus = 1
							}
							
							if (!editStatus) {
								this.viewValue = computes[computes.length - 2]
								editStatus = 0
							}
						}
						
						break;
					// 等于
					case KEYS[KEYS.length - 1]:
						if (cacheLastSymbol.length == 2) { // 第一次计算结束
							computes[0] = operation(computes[0], cacheLastSymbol[1], cacheLastSymbol[0])
						}
						if (countSymbol1 || countSymbol2) { // 存在操作符时，将操作符加入缓存变量
							if (isSymbol()) { // 判断最后一个是操作符则取操作符前一个
								cacheLastSymbol[0] = computes[computes.length - 1]
								cacheLastSymbol[1] = computes[computes.length - 2]
							} else {
								cacheLastSymbol[0] = computes[computes.length - 2]
								cacheLastSymbol[1] = computes[computes.length - 1]
							}
						}
					
						if (countSymbol1) numFun('1', countSymbol1)
						if (countSymbol2) numFun('0', countSymbol2)
						
						// 清除操作符统计
						countSymbol1 = 0
						countSymbol2 = 0
						
						if (computes.length == 1) {
							this.viewValue = computes[0]
						}
						break;
					// 取反
					case KEYS[1]:
						// 兼容-0的情况
						if (this.viewValue === '-0') {
							this.viewValue = 0
						} else {
							this.viewValue = this.viewValue >= 0 ? '-' + this.viewValue : Math.abs(this.viewValue)
						}
						if (computes.length == 1) {
							computes[0] = this.viewValue
						} else {
							const lastIndex = computes.lastIndexOf(this.viewValue)
							computes.splice(lastIndex, 1, this.viewValue)
						}
						break;
					// 百分号
					case KEYS[2]:
						this.viewValue = this.viewValue * 0.01
						if (computes.length == 1) {
							computes[0] = this.viewValue
						} else {
							const lastIndex = computes.lastIndexOf(this.viewValue)
							computes.splice(lastIndex, 1, this.viewValue)
						}
						break;
					// 数字
					default:
						if (this.viewValue.length > (String(this.viewValue).indexOf('.') != -1 ? 9 : 8)) {
							return
						}
						
						if (editStatus) {
							if (editStatus === 1) {
								const previousSymbolIndex = computes.length - 3
								computes.splice(previousSymbolIndex - 1, 3, operation(computes[previousSymbolIndex - 1], computes[previousSymbolIndex + 1], computes[previousSymbolIndex]))
							}
							if (editStatus === 2) computes.splice(0, computes.length - 1, this.viewValue)
							editStatus = 0
						}
						
						if (isSymbol()) {
							this.viewValue = target.dataset.text
							computes.push(this.viewValue)
						} else {
							// 判断是否存在 .
							if (String(this.viewValue).indexOf('.') != -1 && target.dataset.text === '.') {
								return
							}
							// 三元判断是否为点,避免 Number(.) 会为NaN
							this.viewValue += this.viewValue === 0
								? target.dataset.text !== '.' ? Number(target.dataset.text) : target.dataset.text
								: target.dataset.text
							computes[computes.length > 0 ? computes.length - 1 : 0] = this.viewValue
						}
						
						this.btns[0].text = computes.length > 0 || this.viewValue > 0 ? 'C' : KEYS[0]
				}
				
				console.log(computes);
				
			},
			// 格式化
			formatt(val) {
				if (/\.$/.test(val)) {
					return val
				} else {
					return Number(val).toLocaleString('en-US', {
						minimumFractionDigits: 0,
						maximumFractionDigits: 8
					})
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.content {
		display: flex;
		flex-wrap: wrap;
		align-content: flex-end;
		background: #000000;
		min-height: 100vh;
		box-sizing: border-box;
		padding: 30rpx;
		font-family: PingFangSC-Regular, sans-serif;
		
		> view {
			width: 100%;
			color: #ffffff;
		}
		
		.view {
			text-align: right;
			font-size: 168rpx;
			line-height: 100px;
			> .lessen {
				font-size: 138rpx;
			}
			> span {
				display: inline-block;

				box-sizing: border-box;
				-webkit-user-select: text;
				-moz-user-select: text;
				-ms-user-select: text;
				user-select: text;
				overflow: hidden;
				border-radius: 20rpx;
				&::selection {
					background-color: #333;
					color: #fff;
				}
			}
		}
		
		.btns {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			height: 870rpx;
			> view {
				width: 144rpx;
				height: 144rpx;
				border-radius: 144rpx;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 60rpx;
				color: #ffffff;
				transition: all .3s;
				background: #333333;
				&.origin {
					background: #fea00c;
					&:active {
						background: #ffffff;
						color: #fea00c;
					}
				}
				&.gray {
					background: #a5a5a5;
					color: #000000;
					&:active {
						background: #eeeeee;
					}
				}
				&.default {
					&:active {
						background: #bbbbbb;
					}
				}
				&::after {
					content: attr(data-text);
				}
			}
		}
	}
</style>
