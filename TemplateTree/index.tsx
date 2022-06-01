import React, { Component } from 'react'
import { Empty, Icon, Input, message, Popconfirm, Spin, Tree } from 'antd'
import { connect } from 'dva'
import './index.less'
/**
 *
 * @param {string} modelName  The replace model's name
 * @param {object} effects
 */
/**
 * 使用替换
 * 1.modelName
 * 2.model的effects
 * 3.model下的属性名称替换
 *
 */
const modelName = 'diagnosisImport'
const effects = {
	getTree: 'getDiagnosisTemplet',
	deleteNode: 'deleteDiagnosisTemplet',
	editNode: '',
	saveNode: '',
	addNOde: '',
}
@connect(({ loading, diagnosisImport }) => ({ loading, diagnosisImport }))
export default class TemplateTree extends Component {
	componentDidMount() {
		this.refreshTree()
	}
	// 数据刷新
	refreshTree = () => {
		this.props.dispatch({
			type: `${modelName}/${effects.getTree}`,
		})
	}
	// 选中节点
	onSelect = (_, e) => {
		const { eventKey, isFolder } = e.node.props
		const selectedKey = this.props[modelName].selectedNodeKey
		if (selectedKey !== eventKey) {
			this.props.dispatch({
				type: `${modelName}/reducer`,
				selectedNodeKey: eventKey,
				editingNodeKey: '',
			})
		}
	}
	// 删除节点
	delete = item => {
		const [children, key] = [item.children, item.key]
		if (children && children.length > 0) {
			message.destroy()
			message.warn('请先删除目录下的模板！')
			return
		}
		this.props.dispatch({
			type: `${modelName}/deleteDiagnosisTemplet`,
			payload: { key },
			// callback: () => {
			//     this.refreshTree();
			// },
		})
	}
	// 展开节点
	onExpand = expandedKeys => {
		this.props.dispatch({
			type: `${modelName}/reducer`,
			termTreeExpKeys: expandedKeys,
		})
	}
	// 将节点设置为正在编辑状态
	setNodeEditing = key => {
		this.props.dispatch({
			type: `${modelName}/reducer`,
			editingNodeKey: key,
		})
	}
	//  新增节点
	addNode = async item => {
		const [key, expandedKeys, isFolder] = [
			item.key,
			this.props[modelName].termTreeExpKeys,
			!item.children && item.isFolder == 0,
		]
		// 如果新增的目录折叠了，展开该目录
		if (expandedKeys.indexOf(key) === -1) {
			expandedKeys.push(key)
			this.props.dispatch({
				type: `${modelName}/reducer`,
				termTreeExpKeys: [...expandedKeys],
			})
		}
		await this.props.dispatch({
			type: `${modelName}/addDiagnosisTemplate`,
			payload: {
				parentId: key,
				isFolder: isFolder,
			},
		})
		// await this.refreshTree();
	}
	// 保存编辑结果
	saveEdit = async item => {
		const value = this.editInput.input.value.trim()
		console.log(value)
		if (value.length === 0) {
			message.destroy()
			message.error('名称不能为空！')
			return
		}
		await this.props.dispatch({
			type: 'diagnosisImport/updateDiagnosisTemplet',
			payload: { value },
		})
		await this.props.dispatch({
			type: `${modelName}/reducer`,
			editingNodeKey: '',
		})
		// this.refreshTree();
	}
	// 取消编辑
	cancelEdit = () => {
		this.props.dispatch({
			type: `${modelName}/reducer`,
			editingNodeKey: '',
		})
	}
	// 拖拽
	onDrop = info => {
		const [editedKey, visitType] = [
			this.props[modelName].editingNodeKey,
			this.props[modelName].selectedVisitType,
		]
		if (editedKey) {
			message.destroy()
			message.error('当前存在正在编辑名称的节点，不允许拖动！')
			return
		}
		// 拖拽的节点
		const fromNodeProps = info.dragNode.props
		const fromNodeKey = fromNodeProps.eventKey
		// 拖向的节点
		const toNodeProps = info.node.props
		const toNodeKey = toNodeProps.eventKey
		// 要拖向的位置
		const dropPos = toNodeProps.pos.split('-')
		const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
		// 是否要成为目标节点的子节点
		let beChild = !info.dropToGap
		if (beChild && toNodeProps.isLeaf) {
			message.destroy()
			message.error('不能成为叶子节点的子节点！')
			return
		}
		// 拖动的类型 0：目录内 -1：目标上方 1：目标下方
		let type = 1
		if (beChild) {
			type = 0
		} else if (dropPosition === -1) {
			type = -1
		}
		const fromIsFolder = fromNodeProps.isFolder === 1
		const toIsFolder = toNodeProps.isFolder === 1
		if (fromIsFolder) {
			// 目录只能拖动到同级的目录上方或者下方
			if (type === 0 || !toIsFolder) {
				message.destroy()
				message.error('目录节点不能拖动到别的类目下！')
				return
			}
		} else {
			if (toIsFolder && type !== 0) {
				message.destroy()
				message.error('叶子节点不允许拖拽到最外层！')
				return
			}
		}
		this.props.dispatch({
			type: `${modelName}/moveMedicalTermTemplet`,
			payload: {
				applyEnv: visitType,
				movedNodeID: fromNodeKey,
				moveToNodeID: toNodeKey,
				location: type,
			},
			callback: () => {
				this.refreshTree()
			},
		})
	}
	// 拖动节点到目标节点范围触发的事件
	onDragEnter = info => {
		this.props.dispatch({
			type: `${modelName}/reducer`,
			termTreeExpKeys: info.expandedKeys,
		})
	}
	onKeyPressFun = (e, item) => {
		var keynum = e.keyCode
		if (keynum == 13) {
			this.saveEdit(item)
		}
	}
	// 渲染树节点
	renderTreeNodes = data => {
		const [editedKey, selectedKey] = [
			this.props[modelName].editingNodeKey,
			this.props[modelName].selectedNodeKey,
		]
		return data.map(item => {
			const [key, name, parentId, children] = [
				item.key,
				item.title,
				item.parentId,
				item.children,
			]
			let title
			if (editedKey === key) {
				// 正在编辑
				title = (
					<span className='template-manage-tree-edit' onClick={e => e.stopPropagation()}>
						<Input
							defaultValue={name}
							size='small'
							autoFocus
							ref={e => (this.editInput = e)}
							onKeyDown={e => this.onKeyPressFun(e, item)}
						/>
						<span>
							<Icon
								type='close-circle'
								theme='twoTone'
								twoToneColor='#08979C'
								onClick={this.cancelEdit}
							/>
							<Icon
								type='check-circle'
								theme='twoTone'
								twoToneColor='#08979C'
								onClick={() => this.saveEdit(item)}
							/>
						</span>
					</span>
				)
			} else {
				title = (
					<>
						<span>{name}</span>
						{selectedKey !== key ? null : (
							<span
								className='template-manage-tree-icon'
								onClick={e => e.stopPropagation()}>
								{parentId && children ? (
									<img
										src={require('@/assets/icon/ic-新增.svg')}
										onClick={() => this.addNode(item)}
									/>
								) : null}
								<img
									src={require('@/assets/icon/ic-编辑.svg')}
									onClick={() => this.setNodeEditing(key)}
								/>
								<img src={require('@/assets/icon/ic-拖动.svg')} />
								<Popconfirm
									title='是否确认删除？'
									cancelText='否'
									okText='是'
									onConfirm={() => this.delete(item)}>
									<img
										src={require('@/assets/icon/ic-删除.svg')}
										style={{ marginTop: 3 }}
									/>
								</Popconfirm>
							</span>
						)}
					</>
				)
			}
			if (children) {
				return (
					<Tree.TreeNode
						{...item}
						key={key}
						title={title}
						icon={
							<img
								src={require('@/assets/icon/ic-文件夹.svg')}
								className='template-manage-tree-folder'
							/>
						}>
						{children && this.renderTreeNodes(children)}
					</Tree.TreeNode>
				)
			}
			return (
				<Tree.TreeNode
					{...item}
					key={key}
					title={title}
					isLeaf
					icon={
						<img
							src={require('@/assets/icon/ic-功能.svg')}
							className='template-manage-tree-leaf'
						/>
					}
				/>
			)
		})
	}
	render() {
		const { loading } = this.props
		const [tree, selectedKey, expandedKeys] = [
			this.props[modelName].templateTree,
			this.props[modelName].selectedNodeKey,
			this.props[modelName].termTreeExpKeys,
		]
		return (
			// <Spin
			// // spinning={
			// //     loading.effects['diagnosisImport/getMedicalTermTemplet'] ||
			// //     loading.effects['diagnosisImport/getMedicalTermTypes'] ||
			// //     loading.effects['diagnosisImport/getAuthorizedDeptList']
			// // }
			// >
			<div>
				{tree && tree.length > 0 ? (
					<Tree
						showIcon
						draggable
						className='diagnosis-import-template--tree'
						selectedKeys={[selectedKey]}
						onSelect={this.onSelect}
						expandedKeys={expandedKeys}
						onExpand={this.onExpand}
						onDrop={this.onDrop}
						onDragEnter={this.onDragEnter}>
						{this.renderTreeNodes(tree)}
					</Tree>
				) : (
					<Empty />
				)}
			</div>
			// </Spin>
		)
	}
}
