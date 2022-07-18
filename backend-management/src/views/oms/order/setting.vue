<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="orderSetting"
             ref="orderSettingForm"
             :rules="rules"
             label-width="150px">
      <el-form-item label="秒杀订单超过：" prop="flashOrderOvertime">
        <el-input v-model="orderSetting.flashOrderOvertime" class="input-width">
          <template #append>分</template>
        </el-input>
        <span class="note-margin">未付款，订单自动关闭</span>
      </el-form-item>
      <el-form-item label="正常订单超过：" prop="normalOrderOvertime">
        <el-input v-model="orderSetting.normalOrderOvertime" class="input-width">
          <template #append>分</template>
        </el-input>
        <span class="note-margin">未付款，订单自动关闭</span>
      </el-form-item>
      <el-form-item label="发货超过：" prop="confirmOvertime">
        <el-input v-model="orderSetting.confirmOvertime" class="input-width">
          <template #append>天</template>
        </el-input>
        <span class="note-margin">未收货，订单自动完成</span>
      </el-form-item>
      <el-form-item label="订单完成超过：" prop="finishOvertime">
        <el-input v-model="orderSetting.finishOvertime" class="input-width">
          <template #append>天</template>
        </el-input>
        <span class="note-margin">自动结束交易，不能申请售后</span>
      </el-form-item>
      <el-form-item label="订单完成超过：" prop="commentOvertime">
        <el-input v-model="orderSetting.commentOvertime" class="input-width">
          <template #append>天</template>
        </el-input>
        <span class="note-margin">自动五星好评</span>
      </el-form-item>
      <el-form-item>
        <el-button
          @click="confirm()"
          type="primary">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  
</template>

<script>
import { defineComponent, reactive, ref, toRefs, onMounted } from 'vue'
import {getOrderSetting,updateOrderSetting} from '@/api/orderSetting';
import {ElMessage, ElMessageBox} from 'element-plus'
import Distpicker from '@/components/Distpicker'
export default defineComponent({
  components: {Distpicker},
    setup() {

      const orderSettingForm = ref(null);
      const defaultOrderSetting = {
        id: null,
        flashOrderOvertime: 0,
        normalOrderOvertime: 0,
        confirmOvertime: 0,
        finishOvertime: 0,
        commentOvertime: 0
      };  
      const checkTime = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('时间不能为空'));
        }
        console.log("checkTime",value);
        let intValue = parseInt(value);
        if (!Number.isInteger(intValue)) {
          return callback(new Error('请输入数字值'));
        }
        callback();
      };

      const states = reactive({
        orderSetting: Object.assign({}, defaultOrderSetting),
        rules: {
          flashOrderOvertime:{validator: checkTime, trigger: 'blur' },
          normalOrderOvertime:{validator: checkTime, trigger: 'blur' },
          confirmOvertime: {validator: checkTime, trigger: 'blur' },
          finishOvertime: {validator: checkTime, trigger: 'blur' },
          commentOvertime:{validator: checkTime, trigger: 'blur' }
        }
      });
      const methods = reactive({

        change(data){
          console.log("aaa", data)
        },
        confirm(){
          orderSettingForm.value.validate((valid) => {
            if (valid) {
              ElMessageBox.confirm('是否要提交修改?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                updateOrderSetting(1,states.orderSetting).then(()=>{
                  ElMessage({
                    type: 'success',
                    message: '提交成功!',
                    duration:1000
                  });
                })
              });
            } else {
              ElMessage({
                message: '提交参数不合法',
                type: 'warning'
              });
              return false;
            }
          });
        },
        getDetail(){
          getOrderSetting(1).then(response=>{
            states.orderSetting=response.data;
          })
        }
      });

      onMounted(()=>{
        methods.getDetail()
      })

      return {
        orderSettingForm,
        ...toRefs(states),
        ...toRefs(methods)
      }

    },
})
</script>

<style scoped>
.input-width {
width: 50%;
}
.form-container{
  width: 800px;
  margin: 0 auto;
}
.note-margin {
margin-left: 15px;
}
</style>