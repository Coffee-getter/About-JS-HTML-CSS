/**
 * @desc 编辑格、编辑行定义
 *
 */
import React from 'react'
import { Input, Form, Select, Radio } from 'antd'
import classNames from 'classnames/bind'
import { connect } from 'dva'
import '../index.less'
interface Iprops {
	editable: boolean
	dataIndex: string
	title: string
	record: object
	handleSave: Function
}
const editCells = [
	'type',
	'isMain',
	'prefix',
	'diagnosisDesc',
	'suffix',
	'syndromeDesc',
	'operations',
]
@connect(({ diagnosisImport }) => ({ diagnosisImport }))
export class EditableCell extends React.Component<Iprops> {
	state = {
		editing: false,
	}
	toggleEdit = () => {
		const editing = !this.state.editing
		this.setState({ editing }, () => {
			if (editing) {
				this.ref.focus()
			}
		})
	}
	save = async e => {
		const { record, handleSave } = this.props
		await this.form.validateFields(async (error, values) => {
			if (error && error[e.currentTarget.id]) {
				return
			}
			this.toggleEdit()
			await handleSave({ ...record, ...values })
		})
	}
	//类别
	setFirstCell = form => {
		const { dataIndex, record, title } = this.props
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(
					<Select
						showSearch
						optionFilterProp={() => {}}
						style={{ width: '100%' }}
						ref={node => (this.ref = node)}
						onPressEnter={this.save}
						onBlur={this.save}>
						<Select.Option value='西医'>西医</Select.Option>
						<Select.Option value='中医'>中医</Select.Option>
					</Select>
				)}
			</Form.Item>
		)
	}
	//前缀
	setTwiceCell = form => {
		const { dataIndex, record, title } = this.props
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(<Radio />)}
			</Form.Item>
		)
	}
	//前缀
	setThirdCell = form => {
		const { dataIndex, record, title } = this.props
		const { prefixDict } = this.props.diagnosisImport
		console.log(prefixDict, 'prefix')
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(
					<Select
						showSearch
						filterOption={props => {
							console.log(props)
						}}
						style={{ width: '100%' }}
						ref={node => (this.ref = node)}
						onPressEnter={this.save}
						onBlur={this.save}>
						{prefixDict?.map(item => {
							return (
								<Select
									value={item.itemName}
									inputCode={item.inputCode}
									code={item.itemCode}>
									{item.itemName}
								</Select>
							)
						})}
					</Select>
				)}
			</Form.Item>
		)
	}
	//诊断描述
	setFourthCell = form => {
		const { dataIndex, record, title } = this.props
		const { xyDiagDict, zyDiagDict } = this.props.diagnosisImport
		let _dragDict = record.type == '中医' ? zyDiagDict : xyDiagDict
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(
					<Select
						showSearch
						filterOption={props => {
							console.log(props)
						}}
						style={{ width: '100%' }}
						ref={node => (this.ref = node)}
						onPressEnter={this.save}
						onBlur={this.save}>
						{_dragDict?.map(item => {
							return (
								<Select
									value={item.itemName}
									inputCode={item.inputCode}
									code={item.itemCode}>
									{item.itemName}
								</Select>
							)
						})}
					</Select>
				)}
			</Form.Item>
		)
	}
	//后缀描述
	setFifthCell = form => {
		const { dataIndex, record, title } = this.props
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(
					<Input
						ref={node => (this.ref = node)}
						onPressEnter={this.save}
						onBlur={this.save}
					/>
				)}
			</Form.Item>
		)
	}
	//证候
	setSixthCell = form => {
		const { dataIndex, record, title } = this.props
		const { synDict } = this.props.diagnosisImport
		const _disabled = record.type == '中医' ? false : true
		return (
			<Form.Item style={{ margin: 0 }}>
				{form.getFieldDecorator(dataIndex, {
					rules: [
						{
							required: false,
							message: `${title} is required.`,
						},
					],
					initialValue: record[dataIndex],
				})(
					<Select
						showSearch
						filterOption={props => {
							console.log(props)
						}}
						style={{ width: '100%' }}
						ref={node => (this.ref = node)}
						onPressEnter={this.save}
						onBlur={this.save}>
						{synDict?.map(item => {
							return (
								<Select
									value={item.itemName}
									inputCode={item.inputCode}
									code={item.itemCode}>
									{item.itemName}
								</Select>
							)
						})}
					</Select>
				)}
			</Form.Item>
		)
	}
	setEditCell = form => {
		const { dataIndex } = this.props
		let element = <></>
		if (dataIndex == editCells[0]) {
			element = this.setFirstCell(form)
		} else if (dataIndex == editCells[1]) {
			element = this.setTwiceCell(form)
		} else if (dataIndex == editCells[2]) {
			element = this.setThirdCell(form)
		} else if (dataIndex == editCells[3]) {
			element = this.setFourthCell(form)
		} else if (dataIndex == editCells[4]) {
			element = this.setFifthCell(form)
		} else if (dataIndex == editCells[5]) {
			element = this.setSixthCell(form)
		}
		return element
	}
	renderCell = form => {
		this.form = form
		const { children } = this.props
		const { editing } = this.state
		return editing ? (
			this.setEditCell(form)
		) : (
			<div
				className={classNames({
					'editable-cell-value-wrap': true,
					'no-editable-cell-value-wrap': true,
				})}
				onClick={this.toggleEdit}>
				{children}
			</div>
		)
	}

	render() {
		const { editable, dataIndex, title, record, index, handleSave, children, ...restProps } =
			this.props
		return (
			<td {...restProps}>
				{editable ? (
					<EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
				) : (
					children
				)}
			</td>
		)
	}
}
const EditableContext = React.createContext()
const EditableRow = ({ form, index, ...props }) => (
	<EditableContext.Provider value={form}>
		<tr {...props} />
	</EditableContext.Provider>
)
export const EditableFormRow = Form.create()(EditableRow)
