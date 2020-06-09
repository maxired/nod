<template>
  <div id="app_meet_party_button" :class="nodDetected ? 'withNode' : ''">
    <ReactionTray v-if="loaded" />
    <MessageWrapper v-if="loaded" />
  </div>
</template>

<script>
import ReactionTray from "./components/reactions/ReactionTray.vue";
import MessageWrapper from "./components/messages/MessageWrapper.vue";
import { contains, waitForElement } from "./utils";

export default {
  name: "App",
  data() {
    return {
      loaded: false,
      nodDetected: false,
    };
  },
  components: {
    ReactionTray,
    MessageWrapper,
  },
  created: function() {
    this.getData();
    this.$options.sockets.onopen = (data) => {
      this.websocketInit();
      this.setupListeners();
    };

    this.setupObserver();
  },

  methods: {
    getData() {
      const dataScript = contains("script", "ds:7");
      const userData = JSON.parse(dataScript[1].text.match(/\[[^\}]*/)[0]);

      const name =  userData[6] || 'Guest'

      const withNode = !!document.querySelector('#app');

      let data = {
        meetingID: document.querySelector("[data-unresolved-meeting-id]").getAttribute("data-unresolved-meeting-id"),
        name: name.split(" ")[0],
        fullName: name,
        team: userData[28],
        avatar: userData[5],
        withNode,
      };
      this.$store.dispatch("addUserData", data);

      const localFullName = localStorage.getItem("nod-isFullName") === "true";
      if (localFullName) {
        this.$store.dispatch("setFullName", localFullName);
      }
    },
    websocketInit() {
      // Display extension
      this.loaded = true;

      // send join message to websocket
      this.$socket.sendObj({
        route: "join",
        data: {
          id: this.$store.getters.getUser("meetingID"),
          team: this.$store.getters.getUser("team"),
        },
      });

      // Send console message
      console.log("%c Initialised Nod Extension.", "background: #4D2F3C; color: #FBE2A0");
      console.log("%c Something gone wrong? Let me know - hi@jamiec.io", "background: #4D2F3C; color: #FBE2A0");

      // Send ping to keep socket connection open
      const ping = () => {
        console.log("Keeping Nod alive...");
        this.$socket.sendObj({ route: "ping" });
      };

      let keepAlive = setInterval(ping, 60000 * 9);
    },

    setupListeners() {
      this.setupTabListener();
      this.setupDestroyListener();
      this.setupVisibilityListeners();
    },

    setupVisibilityListeners() {
      const vm = this;
      document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "hidden") {
          vm.$store.dispatch("setVisible", false);
        } else {
          vm.$store.dispatch("setVisible", true);
        }
      });
    },
    setupTabListener() {
      document.addEventListener("keydown", function(event) {
        if (event.keyCode === 9) {
          if (document.activeElement == document.body || document.activeElement == null) {
            event.preventDefault();
            document.getElementById("nodBtn").focus();
          }
        }
      });
    },

    async setupDestroyListener() {
      window.addEventListener("beforeunload", (event) => {
        this.$socket.sendObj({
          route: "disconnect",
          data: { id: this.$store.getters.getUser("meetingID") },
        });
      });

      // wait for meet to relay call ended message
      while (document.querySelector("[data-call-ended='true']") == null) {
        await new Promise((r) => setTimeout(r, 200));
      }
      this.loaded = false;
      this.$socket.sendObj({
        route: "disconnect",
        data: { id: this.$store.getters.getUser("meetingID") },
      });
      this.$socket.close();
    },

    setupObserver(){
      var body = document.querySelector('body');

// Options de l'observateur (quelles sont les mutations à observer)
var config = { attributes: false, childList: true };

// Fonction callback à éxécuter quand une mutation est observée
const callback = (mutationsList)  => {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            const hasAppIp = Array.from(mutation.addedNodes).find(node => node.id === 'app')
            if(hasAppIp){
              this.nodDetected = true
            }
        }
    }
};

// Créé une instance de l'observateur lié à la fonction de callback
const observer = new MutationObserver(callback);

// Commence à observer le noeud cible pour les mutations précédemment configurées
observer.observe(body, config);
    }
  },
};
</script>

<style>
#app_meet_party_button {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100000;
}

#app_meet_party_button.withNode {
    top: 48px;
    z-index: 2;
}

/* Styles for Meet */
.pHsCke {
  padding-left: 270px !important;
  box-sizing: border-box;
}
</style>
