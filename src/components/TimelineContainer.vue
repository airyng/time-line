<template>
  <div>
    <p>
      <strong>Result:</strong>
      <template v-if="dataRange && dataRange.humanFormat">
        {{dataRange.humanFormat.start}} - {{dataRange.humanFormat.end}}
      </template>
      <template v-else>
        --
      </template>
    </p>
    <v-scale
      v-model="dataRange"
      :controls="controls"
      :disabled="disabled"
      :start="start"
      :end="end"
      :streakFormat="streakFormat"
      :dateFormat="dateFormat"
      class="mt-5"
    />
  </div>
</template>

<script>
import VScale from '@/components/VScale'
export default {
  components: { VScale },
  props: {
    start: { type: String, required: true },
    end: { type: String, required: true },
    controls: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    range: { type: Object, default: null },
    streakFormat: { type: String, default: 'DD.MM.YYYY' },
    dateFormat: { type: String, default: null }, 
  },
  data () {
    return {
      dataRange: null
    }
  },
  created () {
    this.dataRange = this.range
  }
}
</script>