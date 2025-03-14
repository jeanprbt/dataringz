<template>
  <div class="full-screen-popup" @click="closePopup">
    <div class="popup-content" @click.stop>
      <h3>{{ title }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
  },
  methods: {
    closePopup() {
      this.$emit('close');
    }
  }
});
</script>

<style>
.full-screen-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}
</style>