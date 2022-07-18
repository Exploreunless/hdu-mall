<template>
  <el-card class="form-container" shadow="never">
    <el-tree
      :data="menuTreeList"
      show-checkbox
      default-expand-all
      node-key="id"
      ref="tree"
      highlight-current
      :props="defaultProps">
    </el-tree>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave()">保存</el-button>
      <el-button @click="handleClear()">清空</el-button>
    </div>

  </el-card>
</template>

<script>
import {fetchTreeList} from '@/api/menu';
import {listMenuByRole,allocMenu} from '@/api/role';
import {defineComponent, onMounted, reactive, ref, toRefs} from 'vue'
import { useRoute, useRouter } from 'vue-router';
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  name: "allocMenu",
  setup(){
    const states = reactive({
      menuTreeList: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      roleId:null
    })
    const route = useRoute();
    const tree = ref(null);
    const router = useRouter();
    const methods = reactive({
      treeList() {
        fetchTreeList().then(response => {
          states.menuTreeList = response.data;
          console.log(states.menuTreeList)
        });
      },
      getRoleMenu(roleId){
        listMenuByRole(roleId).then(response=>{
          console.log(response)
          let menuList = response.data;
          let checkedMenuIds=[];
          if(menuList!=null&&menuList.length>0){
            for(let i=0;i<menuList.length;i++){
              let menu = menuList[i];
              if(menu.parentId!==0){
                checkedMenuIds.push(menu.id);
              }
            }
          }
          tree.value.setCheckedKeys(checkedMenuIds);
        });
      },

      handleSave() {
        let checkedNodes = tree.value.getCheckedNodes();
        console.log(checkedNodes);
        let checkedMenuIds=new Set();
        if(checkedNodes!=null&&checkedNodes.length>0){
          for(let i=0;i<checkedNodes.length;i++){
            let checkedNode = checkedNodes[i];
            checkedMenuIds.add(checkedNode.id);
            if(checkedNode.parentId!==0){
              checkedMenuIds.add(checkedNode.parentId);
            }
          }
        }
        ElMessageBox.confirm('是否分配菜单？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          let params = new URLSearchParams();
          params.append("roleId",states.roleId);
          params.append("menuIds",Array.from(checkedMenuIds));
          allocMenu(params).then(() => {
            ElMessage({
              message: '分配成功',
              type: 'success',
              duration: 1000
            });
            router.back();
          })
        })
      },
      handleClear() {
        tree.value.setCheckedKeys([]);
      }
    })
    onMounted(()=>{ 
      states.roleId = route.query.roleId;
      methods.treeList();
      methods.getRoleMenu(states.roleId);
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

</style>
