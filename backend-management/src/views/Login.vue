<template>
    <div class="login-container">
        <header class="login-wrapper">
            <div class="logo">
                <a href="javascript:;">&nbsp;</a>
                <span>统一身份认证平台</span>
            </div>
        </header>

        <article :class="{'login-box':true, 'login-box-translate':toggleFlag==='off'}" >
            <section class="login-content-box">
                <!-- 登录选项 -->
                <ul class="login-content-up">
                    <li v-for="item in loginOptions" :key="item.index" @click="selectLoginOption(item.index)" 
                    :class="{'is-active': item.index !== loginFlag}">
                        <a href="javascript:;" @click="loginFlag = item.index">{{item.name}}</a>
                    </li>
                </ul>
                <!-- 登录表单 -->
                <div v-show="toggleFlag==='on'">
                    <!-- 账号登录box -->
                    <div class="account-login-box common-login" v-if="loginFlag===0" >
                        <form class="needs-validation" id="login-form" ref="loginFormRef" novalidate>
                            <div class="mb-3">
                                <input type="text" class="form-control" v-model="loginForm[0].username" placeholder="请输入账号" required>
                                <div class="invalid-feedback">账号为空</div> 
                            </div>
                            <div class="mb-3">
                                <input type="password" class="form-control" v-model="loginForm[0].password" placeholder="请输入密码" required>
                                <div class="invalid-feedback">密码为空</div>
                            </div> 
                            <div class="mb-3 form-check">
                              <div class="save-account">
                                  <input type="checkbox" class="form-check-input" id="exampleCheck1" v-model="isSaveAccount">
                                  <label class="form-check-label">记住账号</label>
                              </div>
                              
                              <div class="find-password">
                                  <a class="form-check-label">找回密码</a>
                              </div>
                          </div>
                          <button type="button" class="btn btn-primary" @click="toLogin">登  录</button>
                        </form> 
                    </div >
                    <!-- 二维码登录box -->
                    <div class="er-login-box common-login" v-if="loginFlag===1">
                        <img src="../assets/img/erweima.jpg" alt="">
                        <span>请使用手机支付宝，扫描二维码登录</span>
                    </div>
                    <!-- 手机号登录box -->
                    <div class="phone-login-box common-login" v-if="loginFlag===2">
                        <form>
                            <div class="mb-3">
                                <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="请输入手机号">
                            </div>
                            <div class="mb-3">
                                <input type="text" class="form-control" id="exampleInputPassword1" placeholder="请输入验证码">
                            </div>
                            <div class="mb-3">
                                <button type="button" class="btn btn-success">获取短信验证码</button>
                            </div>
                            <button type="submit" class="btn btn-primary">下一步</button>

                        </form>
                    </div>
                </div>
            </section>
            <div :class="['toggle-btn', toggleIcon[toggleFlag]]" @click="toggleFlag = (toggleFlag === 'on'? 'off': 'on')">
            </div>
        </article>
        <footer>

        </footer>
    </div>
</template>

<script>
import {ref, reactive, defineComponent, toRefs} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
export default defineComponent({
    setup() {
        // 常量
        const store = useStore();
        const router = useRouter();
        const loginFormRef = ref(null)
        // 变量
        const states = reactive({
            loginOptions: [
                {index: 0, name: '账号登录' },
                {index: 1, name: '二维码登录' },
                {index: 2, name: '手机号登录'}
            ],
            loginFlag: 0,
            loginForm: [
                {id: 0, username: 'admin', password: 'macro123'},
                {id: 1},
                {id: 2, phone: '', code: ''}
            ],
            toggleFlag: 'on',
            toggleIcon: {
                'on': 'iconfont icon-jianhao_o' ,
                'off': 'iconfont icon-jiahao1'
            },
            isSaveAccount: false,

        })

        const methods = reactive({
            // 选择登录选项
            selectLoginOption: function(idx){
                states.loginFlag = idx
            },
            // 登录
            toLogin: async function (){
                const form = loginFormRef.value
                if(!form.checkValidity()){
                    form.classList.add('was-validated')
                    return
                }
                const res = await store.dispatch('Login', states.loginForm[states.loginFlag])
                console.log(res)
                await router.push('/')
            }
        })
        
        // 方法
        return {
            loginFormRef,
            ...toRefs(states),
            ...toRefs(methods)
        }
    },
})
</script>


<style scoped  lang="less">
    a{
        text-decoration: none;
    }
    .clearfix(){
        content: '';
        clear: both;
        display: block;
    }
    
    .login-container{
        height: 100%;
        background-image: url(../assets/img/login-bg4.jpeg);
        background-size: 100%;
        .login-wrapper{
            width: 100%;
            height: 165px;
            // background-color: rgba(0, 0, 0, 1);

            .logo{
                width: calc(100% - 244px);
                margin: 0 auto;
                line-height: 165px;
                a{
                    width: 391px;
                    height: 148px;
                    background-image: url('../assets/img/login-logo.png');
                    float: left;
                    margin: 8.5px 0;
                }
                span{
                    color: white;
                    font: 28px "microsoft yahei";
                }
            }
            &::after{
                .clearfix();
            }
        }

        .login-box{
            position: fixed;
            top: 200px;
            // bottom: auto;
            right: 200px;
            transition: all 0.8s;

            &::after{
                .clearfix()
            }
            // width: 395px;
            // font: 'microsoft yamei' ;
            .login-content-box{
                background: #fbfcfe;
                border: solid 1px #dedede;
                float: left;
                width: 356px;
                .login-content-up{
                    margin: 0;
                    padding:0;
                    line-height: 43px;
                    
                    .is-active{
                        background-color: #e7e8ea;
                    }
                    li{
                        float: left;
                        width: 100%/3;
                        text-align: center;
                        
                        a{
                            display: inline-block;
                            width: 100%;
                            height: 100%;
                            color: #666;
                            font-weight: bold;
                        }
                    }
                    &::after{
                        .clearfix()
                    }
                }
                .common-login{
                    width: 100%;
                    padding: 35px 20px 20px;
                    button{
                      width: 100%;
                    }
                }

                .account-login-box{
                    .form-check{
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .save-account{
                            line-height: 1;
                            .form-check-label{
                                margin-top: 2px;
                                color: #666;
                            }
                        }
                    }

                }
                .er-login-box{
                    img{
                        width: 183px;
                        margin: 0 auto;
                        // padding: 0;
                        display: block;
                    }
                    span{
                        font-size: 13px;
                        text-align: center;
                        color: #666;
                        width: 100%;
                        display: inline-block;
                        width: 100%;
                    }
                }
                
            }

            .toggle-btn{
                float: left;
                width: 50px;
                line-height: 43px;
                text-align: center;
                background-color: #fbfcfe;
                border: 1px solid #dedede;
                border-left: none;
                font-size: 20px;
                color: #666;
                &:hover{
                    cursor: pointer;
                }
            }

            
        }

        .login-box-translate{
            right: 150px;
            top: 85%;
        }
    }

</style>
