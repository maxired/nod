import Vue from "vue";
import App from "./App.vue";
import VueNativeSock from "vue-native-websocket";
import store from "./store/store";
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;

const devUrl = `wss://dxpuzhzpq8.execute-api.us-east-1.amazonaws.com/dev`
const prodUrl = `wss://vw0c45hcyh.execute-api.us-east-1.amazonaws.com/prod/`

Vue.use(VueNativeSock, prodUrl, {
  format: "json"
});

Vue.use(VueGtag, {
  config: { id: "UA-155560918-5" },
  disableScriptLoad: true
});

new Vue({
  store,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");
