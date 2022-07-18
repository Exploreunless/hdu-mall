<template>
  <el-container class="home-container">
    <el-aside :class="{'left-side-container': true, 'el-menu--collapse': isCollapse}">
      <div class="left-side-logo">
        <a href="#" class="left-side-logo-link">
          <img :class="{'collapse-img':isCollapse}" src="../../assets/img/left-side-logo.png" alt="">
          <h2 v-show="!isCollapse">后台管理系统</h2>
        </a>
      </div>
      <div class="menu">
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          router
        >
          <el-menu-item :index="home.children[0].path" :class="{'submenu-svg-noDropdown':isCollapse}">
            <svg-icon :icon-class="home.children[0].meta.icon"></svg-icon>
            <span>{{home.children[0].meta.title}}</span>
          </el-menu-item>

          <el-sub-menu v-for="item in menuList" :key="item.id" :index="item.path">
            <template #title>
              <svg-icon  :icon-class="item.icon"></svg-icon>
              <span>{{item.title}}</span>
            </template>
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="item.path+'/'+subItem.path">
              <template #title>
                <svg-icon  :icon-class="subItem.icon"></svg-icon>
                <span>{{subItem.title}}</span>
              </template>
            </el-menu-item>
              
          </el-sub-menu>
        </el-menu>
      </div>
    </el-aside>

    <el-container class="right-side-container">
      <el-header>
        <div class="navbar-container">
          <div class="left-navbar">
            <el-button @click="isCollapse=!isCollapse"><el-icon><expand/></el-icon></el-button>
            <breadcrumb></breadcrumb>
          </div>
          <div class="right-navbar">
            <el-dropdown class="avatar-container" trigger="click">
              <div class="avatar-wrapper">
                <img class="user-avatar" :src="avatar()">
                <el-icon><caret-bottom/></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown" >
                  <router-link class="inlineBlock" to="/">
                    <el-dropdown-item>
                      首页
                    </el-dropdown-item>
                  </router-link>
                  <el-dropdown-item divided>
                    <span @click="logout" style="display:block;">退出</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>

            </el-dropdown>
          </div>
        </div>

        <!-- <div class="tags-view-container">
        </div> -->
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>

    </el-container>
  </el-container>
  
</template>

<script>
import {defineComponent, onMounted, reactive, toRefs} from 'vue'
import Breadcrumb from '@/components/Breadcrumb'
import {useRoute} from 'vue-router'
import {mapGetters, useStore} from 'vuex'
import {constantRouterMap} from '@/router/index'
import SvgIcon from '@/components/SvgIcon'// svg组件
import {Expand, CaretBottom} from '@element-plus/icons-vue'
export default defineComponent({
  name: "Layout",
  components:{SvgIcon, Breadcrumb, Expand, CaretBottom},
  setup(){
    const store = useStore();
    const route = useRoute();
    const states = reactive({
      isCollapse: false,
      activePath: '',
      menuList: [],
      home: constantRouterMap[2]
    })

    const methods = reactive({
      logout() {
        store.dispatch('LogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      },
      ...mapGetters(['avatar'])
    })

    onMounted(()=>{
      states.activePath = window.sessionStorage.getItem('activePath');
      states.menuList = store.getters.roleMenus;
    })
    
    return {
      ...toRefs(states),
      ...toRefs(methods),
      route
    }
  },
 
});
</script>


<style lang="less" scoped>
  .clearfix(){
    content: '';
    clear: both;
    display: block;
  }
  .home-container{
    height: 100%;
    .left-side-container{
      background: #fff;
      // height: 100%;
      border-left: 1px solid rgba(121, 131, 114, 0.5);
      transition: width .28s;
      overflow: hidden;
      .left-side-logo{
        overflow: hidden;
        margin: 20px 0 30px;
        line-height: 50px;
        height: 50px;
        box-sizing: border-box;

        .left-side-logo-link{
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-decoration: none;
          overflow: hidden;

          h2{
            font-size: 24px ;
            font-family: Avenir,Helvetica Neue,Arial,Helvetica,sans-serif;
            color: #435ebe;
            font-weight: 600;
            vertical-align: middle;
            margin: 0;
            margin-left: 10px;
            
          }
          .collapse-img{
            height: 60%;
          }
          img{
            height: 100%;
            transition: all .28s;
          }
        }
      }

      .menu{
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        .el-menu-vertical-demo:not(.el-menu--collapse){
          width: 300px;
        }  
        .submenu-svg-noDropdown{
          padding: 0;
          // position: relative;
        }
        .svg-icon{
          margin-right: 16px;
        }
      }
    }

    .right-side-container{
      background: yellow;
      .el-header{
        padding: 0;
        background: #fff;
        height: 50px;
        box-sizing: border-box;
        .navbar-container{
          &::after{
            .clearfix();
          }
          height: 50px;
          box-shadow: 0 1px 4px rgb(228, 234, 238);
          padding: 0;

          // border: 1px solid grey;
          .left-navbar{
            float: left;
            height: 100%;
            display: flex;
            align-items: center;
          }

          .right-navbar{
            float: right;
            height: 100%;
            display: flex;
            align-items: center;
            padding-right: 20px;
            .el-dropdown{
              // vertical-align: baseline;
              img{
                height: 40px;
                margin-right: 3px;
              }
            }
          }
          
        }
        .tags-view-container{
          height: 34px;
          border-bottom: 1px solid #eee;
        }
      }
      .el-main{
        background: #f2f7ff;
      }
    }
  }

     ::-webkit-scrollbar
  {
    width: 5px;
    height: 50px;
    background-color: #fcfcfc;
  }
  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track
  {
    box-shadow: inset 0 0 6px rgba(230, 216, 216, 0.3);
    border-radius: 10px;
    background-color: #fcfcfc;
  }
  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(182, 160, 160, 0.3);
    background-color: #c7c7c7;
  }
  /*滑块效果*/
  ::-webkit-scrollbar-thumb:hover
  {
    border-radius: 5px;
    box-shadow: inset 0 0 5px rgba(210, 188, 188, 0.2);
    background: rgba(185, 170, 170, 0.4);
  }
</style>
