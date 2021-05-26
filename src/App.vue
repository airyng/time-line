<template>
  <div id="app">
    <p>
      <strong>Result:</strong>
      <template v-if="range && range.humanFormat">
        {{range.humanFormat.start}} - {{range.humanFormat.end}}
      </template>
      <template v-else>
        --
      </template>
    </p>
    <v-scale
      v-model="range"
      controls
      start="-30-01-1000"
      end="12 октября 2021 г. 15:12:13"
      class="mt-5"
    />
  </div>
</template>

<script>
import VScale from '@/components/VScale'
export default {
  components: { VScale },
  name: 'App',
  data () {
    return {
      range: null
    }
  }
}
</script>
