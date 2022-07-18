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
          @click="handleAddMenu()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
	<el-card>
		<div class="table-container">
      <el-table ref="menuTable"
                style="width: 100%"
                :data="list"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="菜单名称" align="center">
          <template #default="scope">{{scope.row.title}}</template>
        </el-table-column>
        <el-table-column label="菜单级数" width="100" align="center">
          <template #default="scope">{{levelFilter(scope.row.level)}}</template>
        </el-table-column>
        <el-table-column label="前端名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="前端图标" width="100" align="center">
          <template #default="scope"><svg-icon :icon-class="scope.row.icon"></svg-icon></template>
        </el-table-column>
        <el-table-column label="是否显示" width="100" align="center">
          <template #default="scope">
            <el-switch
              @change="handleHiddenChange(scope.$index, scope.row)"
              :active-value="0"
              :inactive-value="1"
              v-model="scope.row.hidden">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="设置" width="120" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="text"
              :disabled="disableNextLevel(scope.row.level)"
              @click="handleShowNextLevel(scope.$index, scope.row)">查看下级
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="text"
              @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
              size="small"
              type="text"
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
</template>
<script>
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
import {fetchList,deleteMenu,updateHidden} from '@/api/menu'
import {useRouter, useRoute} from 'vue-router'
import {Tickets} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import SvgIcon from '@/components/SvgIcon'
export default defineComponent({
	components: {SvgIcon, Tickets},
	setup() {
		const router = useRouter();
		const route = useRoute();

		const states = reactive({
			list: [],
			total: null,
			listLoading: false,
			listQuery: {
          pageNum: 1,
          pageSize: 5
      },
      parentId: 0
		});
		const methods = reactive({
			handleAddMenu(){
        router.push({path:'/ums/addMenu'})
      },
			resetParentId(){
        states.listQuery.pageNum = 1;
        if (route.query.parentId != null) {
          states.parentId = route.query.parentId;
        } else {
          states.parentId = 0;
        }
      },
			getList() {
        states.listLoading = true;
        fetchList(states.parentId, states.listQuery).then(response => {
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

			handleHiddenChange(index, row) {
        updateHidden(row.id,{hidden:row.hidden}).then(()=>{
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      
      handleShowNextLevel(index, row) {
        router.push({path: '/ums/menu', query: {parentId: row.id}})
      },
     
      handleUpdate(index, row) {
        router.push({path:'/ums/updateMenu', query:{id:row.id}});
      },
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该菜单', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteMenu(row.id).then(() => {
            ElMessage({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            methods.getList();
          });
        });
      },
			levelFilter(value){
				if (value === 0) {
          return '一级';
        } else if (value === 1) {
          return '二级';
        }
			},
			disableNextLevel(value) {
        if (value === 0) {
          return false;
        } else {
          return true;
        }
      }
		})

		onMounted(()=>{
			methods.resetParentId()
			methods.getList();
		})

		watch(() =>router.currentRoute.value.path,()=> {
      methods.resetParentId()
			methods.getList();
		},{ immediate: true, deep: true})


		return {
			...toRefs(states),
			...toRefs(methods)
		}
	},
})
</script>
