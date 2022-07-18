<template>
  <el-card class="form-container" shadow="never">
    <div v-for="(cate,index) in allResourceCate" :class="index===0?'top-line':null" :key="'cate'+cate.id">
      <el-row class="table-layout" style="background: #F2F6FC;">
        <el-checkbox v-model="cate.checked"
                     :indeterminate="isIndeterminate(cate.id)"
                     @change="handleCheckAllChange(cate)">
          {{cate.name}}
        </el-checkbox>
      </el-row>
      <el-row class="table-layout">
        <el-col :span="8" v-for="resource in getResourceByCate(cate.id)" :key="resource.id" style="padding: 4px 0">
          <el-checkbox v-model="resource.checked" @change="handleCheckChange(resource)">
            {{resource.name}}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave()">保存</el-button>
      <el-button @click="handleClear()">清空</el-button>
    </div>

  </el-card>
</template>

<script>
import {fetchAllResourceList} from '@/api/resource';
import {listAllCate} from '@/api/resourceCategory';
import {allocResource,listResourceByRole} from '@/api/role';
import {defineComponent, onMounted, reactive, ref, toRefs, getCurrentInstance} from 'vue'
import { useRoute, useRouter } from 'vue-router';
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  name: "allocResource",
  setup(){
    const states = reactive({
      roleId: null,
      allResource: null,
      allResourceCate: null,
    })
    const route = useRoute();
    const {ctx: that} = getCurrentInstance();
    const tree = ref(null);
    const router = useRouter();
    const methods = reactive({
      getAllResourceList() {
        fetchAllResourceList().then(response => {
          states.allResource = response.data;
          for (let i = 0; i < states.allResource.length; i++) {
            states.allResource[i].checked = false;
          }
          methods.getResourceByRole(states.roleId);
        });
      },
      getAllResourceCateList() {
        listAllCate().then(response => {
          states.allResourceCate = response.data;
          for (let i = 0; i < states.allResourceCate.length; i++) {
            states.allResourceCate[i].checked = false;
          }
          methods.getAllResourceList();
        });
      },
      getResourceByCate(categoryId) {
        let cateResource = [];
        if (states.allResource == null) return null;
        for (let i = 0; i < states.allResource.length; i++) {
          let resource = states.allResource[i];
          if (resource.categoryId === categoryId) {
            cateResource.push(resource);
          }
        }
        return cateResource;
      },
      // 获取需要勾选的框
      getResourceByRole(roleId){
        listResourceByRole(roleId).then(response=>{
          let allocResource = response.data;
          states.allResource.forEach(item=>{
            item.checked = methods.getResourceChecked(item.id,allocResource);
          });
          states.allResourceCate.forEach(item=>{
            item.checked = methods.isAllChecked(item.id);
          });
          that.$forceUpdate();
        });
      },
      // 判断该角色是否有该资源
      getResourceChecked(resourceId,allocResource){
        if(allocResource==null||allocResource.length===0) return false;
        for(let i=0;i<allocResource.length;i++){
          if(allocResource[i].id===resourceId){
            return true;
          }
        }
        return false;
      },
      // 判断该资源分类是否全选
      isAllChecked(categoryId) {
        let cateResources = methods.getResourceByCate(categoryId);
        if (cateResources == null) return false;
        let checkedCount = 0;
        for (let i = 0; i < cateResources.length; i++) {
          if (cateResources[i].checked === true) {
            checkedCount++;
          }
        }
        if(checkedCount===0){
          return false;
        }
        return checkedCount === cateResources.length;
      },
      // 检查子资源是否全选还是为空
      isIndeterminate(categoryId) {
        let cateResources = methods.getResourceByCate(categoryId);
        if (cateResources == null) return false;
        let checkedCount = 0;
        for (let i = 0; i < cateResources.length; i++) {
          if (cateResources[i].checked === true) {
            checkedCount++;
          }
        }
        return !(checkedCount === 0 || checkedCount === cateResources.length);
      },
      // 保存
      handleSave() {
        ElMessageBox.confirm('是否分配资源？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let checkedResourceIds = new Set();
          if (states.allResource != null && states.allResource.length > 0) {
            states.allResource.forEach(item => {
              if (item.checked) {
                checkedResourceIds.add(item.id);
              }
            });
          }
          let params = new URLSearchParams();
          params.append("roleId", states.roleId);
          params.append("resourceIds", Array.from(checkedResourceIds));
          allocResource(params).then(() => {
            ElMessage({
              message: '分配成功',
              type: 'success',
              duration: 1000
            });
            router.back();
          })
        })
      },
      // 清空
      handleClear() {
        states.allResourceCate.forEach(item => {
          item.checked = false;
        });
        states.allResource.forEach(item => {
          item.checked = false;
        });
        that.$forceUpdate();
      },
      // 选中资源分类
      handleCheckAllChange(cate) {
        let cateResources = methods.getResourceByCate(cate.id);
        for (let i = 0; i < cateResources.length; i++) {
          cateResources[i].checked = cate.checked;
        }
        that.$forceUpdate();
      },
      // 选中资源
      handleCheckChange(resource) {
        states.allResourceCate.forEach(item=>{
          if(item.id===resource.categoryId){
            item.checked = methods.isAllChecked(resource.categoryId);
          }
        });
        that.$forceUpdate();
      }
    })
    onMounted(()=>{ 
      states.roleId = route.query.roleId;
      methods.getAllResourceCateList();
    })
  
 
  return {
    tree, 
    ...toRefs(states),
    ...toRefs(methods)
  }
  }
})
</script>

<style scoped>
.input-width {
    width: 70%;
  }
  .form-container {
    width: 70%;
    margin: 0 auto;
    padding-top: 10px;
  }
</style>
