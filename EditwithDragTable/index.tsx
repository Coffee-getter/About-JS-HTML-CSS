import React from 'react'
import { Table, Button, Popconfirm, Radio } from 'antd'
import { EditableFormRow, EditableCell } from './EditableFormCell'
import { DragableBodyRow } from './DragSortingTable'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { connect } from 'dva'

import '../index.less'
import './index.less'
const repla = {
	tkey: 'key',
	modelName: 'diagnosisImport',
	titles: ['类别', '主诊断', '前缀', '诊断', '后缀', '编码', '证候', '时间', '操作'],
	indexs: [
		'type',
		'isMain',
		'prefix',
		'diagnosisDesc',
		'suffix',
		'dragnosisCode',
		'syndromeDesc',
		'lastUpdateTime',
		'operations',
	],
}
@connect(({ diagnosisImport, demo }) => ({ diagnosisImport, demo }))
class DragEditbleTable extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			flag: true,
			count: 2,
			mainKey: 0,
		}
	}
	componentDidMount() {
		this.getData()
	}
	getData = async () => {
		//查询患者列表
		await this.props.dispatch({
			type: `${repla.modelName}/getPatDiagList`,
		})
		//查询全部字典
		await this.props.dispatch({
			type: `${repla.modelName}/getDiagDictGroupList`,
			payload: {
				count: 4,
			},
		})
	}
	moveRow = (dragIndex, hoverIndex) => {
		const { editTemplateList } = this.props[repla.modelName]
		let _list = [...editTemplateList]
		const dragRow = editTemplateList[dragIndex]
		_list?.splice(dragIndex, 1)
		_list?.splice(hoverIndex, 0, dragRow)
		this.props.dispatch({
			type: `${repla.modelName}/reducer`,
			editTemplateList: _list,
		})
		this.setState({ flag: true })
	}
	handleDelete = key => {
		const { editTemplateList } = this.props[repla.modelName]
		this.props.dispatch({
			type: `${repla.modelName}/reducer`,
			editTemplateList: editTemplateList.filter(item => item[repla.tkey] !== key),
		})
	}
	handleAdd = () => {
		const { editTemplateList } = this.props[repla.modelName]
		const count = editTemplateList.length
		const newData = {
			key: count,
			type: '西医',
			diagnosis: '新增诊断',
			ICDcode: 'H9.299',
			syndrome: 'Park Lane no. 0',
			illness: 'warning',
			origin: '无',
		}
		this.props.dispatch({
			type: `${repla.modelName}/reducer`,
			editTemplateList: [...editTemplateList, newData],
		})
	}

	handleSave = row => {
		const { editTemplateList } = this.props[repla.modelName]
		let newData = JSON.parse(JSON.stringify(editTemplateList))
		const index = newData.findIndex(item => row[repla.tkey] == item[repla.tkey])
		const item = newData[index]
		newData.splice(index, 1, {
			...item,
			...row,
		})
		this.props.dispatch({
			type: `${repla.modelName}/reducer`,
			editTemplateList: newData,
		})
	}
	setFlag = () => {
		this.setState(state => ({
			flag: !state.flag,
		}))
	}
	setRadio = record => {
		this.setState({
			mainKey: record[repla.tkey],
		})
	}
	render() {
		const { editTemplateList } = this.props[repla.modelName]
		const { flag } = this.state
		const components = {
			body: flag
				? {
						row: EditableFormRow,
						cell: EditableCell,
				  }
				: { row: DragableBodyRow },
		}
		const dragColumns = this.columns
		const editColumns = this.columns.map(col => {
			if (!col.editable) {
				return col
			}
			return {
				...col,
				onCell: record => ({
					record,
					editable: col.editable,
					dataIndex: col.dataIndex,
					title: col.title,
					handleSave: this.handleSave,
				}),
			}
		})

		return (
			<div className='template-manage-table'>
				{flag ? (
					<Table
						components={components}
						rowKey={record => record[repla.tkey]}
						rowClassName={() => 'editable-row'}
						style={{ border: 0 }}
						dataSource={editTemplateList}
						columns={editColumns}
						pagination={false}
						scroll={{ y: 150 }}
					/>
				) : (
					<DndProvider backend={HTML5Backend}>
						<Table
							style={{ border: 0 }}
							rowKey={record => record[repla.tkey]}
							rowClassName={() => 'dragable-row'}
							columns={dragColumns}
							dataSource={editTemplateList}
							components={components}
							onRow={(record, index) => ({
								index,
								moveRow: this.moveRow,
							})}
							pagination={false}
							scroll={{ y: 150 }}
						/>
					</DndProvider>
				)}
				<div className='template-manage-table-btns'>
					<Button type='link' icon='plus-square' onClick={this.handleAdd}>
						诊断
					</Button>
				</div>
			</div>
		)
	}
	columns = [
		{
			title: repla.titles[0],
			dataIndex: repla.indexs[0],
			width: '5%',
			editable: true,
			ellipsis: true,
		},
		{
			title: repla.titles[1],
			dataIndex: repla.titles[1],
			width: '5%',
			render: (text, record) => {
				const a = 1
				const { a: mainKey } = this.state
				return (
					<Radio
						style={{ marginLeft: '10px' }}
						checked={mainKey === record[repla.tkey]}
						onChange={() => this.setRadio(record)}
						onClick={() => this.setRadio(record)}
					/>
				)
			},
			ellipsis: true,
		},
		{
			title: repla.titles[2],
			dataIndex: repla.titles[2],
			width: '5%',
			editable: true,
			ellipsis: true,
		},
		{
			title: repla.titles[3],
			dataIndex: repla.titles[3],
			width: '12%',
			editable: true,
			ellipsis: true,
		},
		{
			title: repla.titles[4],
			dataIndex: repla.titles[4],
			width: '5%',
			editable: true,
			ellipsis: true,
		},
		{
			title: repla.titles[5],
			dataIndex: repla.titles[5],
			width: '12%',
			editable: false,
			ellipsis: true,
		},
		{
			title: repla.titles[6],
			dataIndex: repla.titles[6],
			width: '5%',
			ellipsis: true,
			render: (text, record) => (
				<div>
					<img src={require('@/assets/icon/ic-拖动.svg')} onMouseDown={this.setFlag} />
					&nbsp;&nbsp;&nbsp;&nbsp;
					<Popconfirm
						title='是否确认删除？'
						cancelText='否'
						okText='是'
						onConfirm={() => this.handleDelete(record.orderValue)}>
						<img src={require('@/assets/icon/ic-删除.svg')} style={{ marginTop: 2 }} />
					</Popconfirm>
				</div>
			),
		},
	]
}
export default DragEditbleTable
