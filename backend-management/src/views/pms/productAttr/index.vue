<template>
  <el-card class="operate-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><Tickets/></el-icon>
        <span>数据列表</span>
      </div>
      <div class="search-right-header">
        <el-button
          class="btn-add"
          @click="handleAddProductAttr()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
  <el-card>
		<div class="table-container">
      <el-table ref="productAttrCateTable"
                style="width: 100%"
                :data="list"
                v-loading="listLoading"
                border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="类型名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="属性数量" width="200" align="center">
          <template #default="scope">{{scope.row.attributeCount==null?0:scope.row.attributeCount}}</template>
        </el-table-column>
        <el-table-column label="参数数量" width="200" align="center">
          <template #default="scope">{{scope.row.paramCount==null?0:scope.row.paramCount}}</template>
        </el-table-column>
        <el-table-column label="设置" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              @click="getAttrList(scope.$index, scope.row)">属性列表
            </el-button>
            <el-button
              size="small"
              @click="getParamList(scope.$index, scope.row)">参数列表
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
		<div class="pagination-container">
      <el-pagination
        v-model:currentPage="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        :page-sizes="[5, 10, 15]"
        small
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
	</el-card>
  <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      :before-close="handleClose()"
      width="30%">
      <el-form ref="productAttrCatForm" :model="productAttrCate" :rules="rules" label-width="120px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="productAttrCate.name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </template>
    </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs, ref } from 'vue'
import {fetchList,createProductAttrCate,deleteProductAttrCate,updateProductAttrCate} from '@/api/productAttrCate'
import {useRouter} from 'vue-router'
import {Search, Tickets, Edit} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'

export default defineComponent({
  components: {Search, Tickets, Edit},
  setup() {
		const router = useRouter();
    const productAttrCatForm = ref(null);
    const productAttrCateTable = ref(null)
		const states = reactive({
			list: [],
			total: null,
			listLoading: false,
			listQuery: {
          pageNum: 1,
          pageSize: 5
      },
      dialogVisible: false,
      dialogTitle:'',
      productAttrCate:{
        name:'',
        id:null
      },
      rules: {
        name: [
          { required: true, message: '请输入类型名称', trigger: 'blur' }
        ]
      }
		});
		const methods = reactive({
			getList() {
        states.listLoading = true;
        fetchList(states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },

      handleSizeChange(val) {
        states.listQuery.pageNum = 1;
        states.listQuery.pageSize = val;
        methods.getList();
      },
      handleCurrentChange(val) {
        states.listQuery.pageNum = val;
        methods.getList();
      },
     
      handleUpdate(index, row) {
        states.dialogVisible = true;
        states.dialogTitle = "编辑类型";
        states.productAttrCate.name = row.name;
        states.productAttrCate.id = row.id;
      },
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该类型', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteProductAttrCate(row.id).then(() => {
            ElMessage({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            methods.getList();
          });
        });
      },
			getAttrList(index, row) {
        router.push({path: '/pms/productAttrList',query:{cid:row.id,cname:row.name,type:0}})
      },
      getParamList(index, row) {
        router.push({path: '/pms/productAttrList',query:{cid:row.id,cname:row.name,type:1}})
      },
      handleAddProductAttr(){
        states.dialogVisible = true;
        states.dialogTitle = "添加类型";
      },

      handleConfirm(){
        console.log(productAttrCatForm)
        productAttrCatForm.value.validate((valid) => {
          if (valid) {
            let data = new URLSearchParams();
            data.append("name",states.productAttrCate.name);
            if(states.dialogTitle==="添加类型"){
              createProductAttrCate(data).then(()=>{
                ElMessage({
                  message: '添加成功',
                  type: 'success',
                  duration:1000
                });
                states.dialogVisible = false;
                methods.getList();
              });
            }else{
              updateProductAttrCate(states.productAttrCate.id,data).then(()=>{
                ElMessage({
                  message: '修改成功',
                  type: 'success',
                  duration:1000
                });
                states.dialogVisible = false;
                methods.getList();
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handleClose(){
        if (!states.dialogVisible && productAttrCatForm.value) {
          productAttrCatForm.value.clearValidate()
        }
      }

		})
		onMounted(()=>{
			methods.getList();
		})
    
		return {
      productAttrCateTable,
      productAttrCatForm,
			...toRefs(states),
			...toRefs(methods)
		}
	},
})
</script>
