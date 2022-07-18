<template>
  <div style="margin-top: 50px">
    <el-form :model="newValues"
             ref="productRelationForm"
             label-width="120px"
             style="width: 680px">
      <el-form-item label="关联专题：">
        <el-transfer
          style="display: inline-block"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入专题名称"
          v-model="selectSubject"
          :titles="subjectTitles"
          :data="subjectList">
        </el-transfer>
      </el-form-item>
      <el-form-item label="关联优选：">
        <el-transfer
          style="display: inline-block"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入优选名称"
          v-model="selectPrefrenceArea"
          :titles="prefrenceAreaTitles"
          :data="prefrenceAreaList">
        </el-transfer>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button  @click="handlePrev">上一步，填写商品属性</el-button>
        <el-button type="primary"  @click="handleFinishCommit">完成，提交商品</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchListAll as fetchSubjectList} from '@/api/subject'
import {fetchList as fetchPrefrenceAreaList} from '@/api/prefrenceArea'
export default defineComponent({
  props: {
    modelValue: Object,
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {emit}) {
    const {modelValue: newValues, isEdit} = toRefs(props)

    const states = reactive({
      //所有专题列表
      subjectList: [],
      //专题左右标题
      subjectTitles: ['待选择', '已选择'],
      //所有专题列表
      prefrenceAreaList: [],
      //专题左右标题
      prefrenceAreaTitles: ['待选择', '已选择']
    });
    const selectSubject = computed({
      get:function () {
        let subjects =[];
        if(newValues.value.subjectProductRelationList==null||newValues.value.subjectProductRelationList.length<=0){
          return subjects;
        }
        for(let i=0;i<newValues.value.subjectProductRelationList.length;i++){
          subjects.push(newValues.value.subjectProductRelationList[i].subjectId);
        }
        return subjects;
      },
      set:function (newValue) {
        newValues.value.subjectProductRelationList=[];
        for(let i=0;i<newValue.length;i++){
          newValues.value.subjectProductRelationList.push({subjectId:newValue[i]});
        }
      }
    })
    const selectPrefrenceArea = computed({
      get:function () {
          let prefrenceAreas =[];
          if(newValues.value.prefrenceAreaProductRelationList==null||newValues.value.prefrenceAreaProductRelationList.length<=0){
            return prefrenceAreas;
          }
          for(let i=0;i<newValues.value.prefrenceAreaProductRelationList.length;i++){
            prefrenceAreas.push(newValues.value.prefrenceAreaProductRelationList[i].prefrenceAreaId);
          }
          return prefrenceAreas;
        },
        set:function (newValue) {
          newValues.value.prefrenceAreaProductRelationList=[];
          for(let i=0;i<newValue.length;i++){
            newValues.value.prefrenceAreaProductRelationList.push({prefrenceAreaId:newValue[i]});
          }
        }
    })
    const methods = reactive({
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1;
      },
      getSubjectList() {
        fetchSubjectList().then(response => {
          let list = response.data;
          for (let i = 0; i < list.length; i++) {
            states.subjectList.push({
              label: list[i].title,
              key: list[i].id
            });
          }
        });
      },
      getPrefrenceAreaList() {
        fetchPrefrenceAreaList().then(response=>{
          let list = response.data;
          for (let i = 0; i < list.length; i++) {
            states.prefrenceAreaList.push({
              label: list[i].name,
              key: list[i].id
            });
          }
        });
      },
      handlePrev(){
        emit('prevStep')
      },
      handleFinishCommit(){
        emit('finishCommit',isEdit);
      }
    })

    onMounted(()=>{
      methods.getSubjectList();
      methods.getPrefrenceAreaList();
    })
    return {
      newValues,
      selectSubject,
      selectPrefrenceArea,
      ...states,
      ...methods
    }
  },
})
</script>

<style scoped>

</style>
