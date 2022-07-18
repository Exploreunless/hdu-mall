<template>
  <el-dialog title="订单跟踪"
             v-model="newValues"
             :before-close="handleClose"
             width="40%">
    <el-steps direction="vertical"
              :active="6"
              finish-status="success"
              space="50px">
      <el-step  v-for="item in logisticsList"
                :key="item.name"
                :title="item.name"
                :description="item.time"></el-step>
    </el-steps>
  </el-dialog>
</template>
<script>
  import {defineComponent, reactive, ref, toRefs, watch} from 'vue'
 
  export default defineComponent({
    props: {
      modelValue: Boolean
    },
    setup(props, {emit}){
      let newValues  = ref(props.modelValue)
      const defaultLogisticsList=[
        {name: '订单已提交，等待付款',time:'2017-04-01 12:00:00 '},
        {name: '订单付款成功',time:'2017-04-01 12:00:00 '},
        {name: '在北京市进行下级地点扫描，等待付款',time:'2017-04-01 12:00:00 '},
        {name: '在分拨中心广东深圳公司进行卸车扫描，等待付款',time:'2017-04-01 12:00:00 '},
        {name: '在广东深圳公司进行发出扫描',time:'2017-04-01 12:00:00 '},
        {name: '到达目的地网点广东深圳公司，快件将很快进行派送',time:'2017-04-01 12:00:00 '},
        {name: '订单已签收，期待再次为您服务',time:'2017-04-01 12:00:00 '}
      ];
      const states = reactive({
        logisticsList:Object.assign({},defaultLogisticsList)
      })
      watch(() => props.modelValue, () => { newValues.value = props.modelValue });
      const methods = reactive({
        emitInput(val) {
          emit('update:modelValue', val)
        },
        handleClose(){
          methods.emitInput(false);
        }
      });
      return {
        newValues,
        ...toRefs(states),
        ...toRefs(methods)
      }

    }
    
  })
</script>
<style></style>


