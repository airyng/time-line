<template>
  <div id="app">
    <TimelineContainer
      :range="range"
      controls
      start="-1000-01-01"
      end="12 октября 2021 г. 15:12:13"
      class="mt-5"
    />
    <hr class="mt-10"/>
    <TimelineContainer
      controls
      start="-1000-01-30"
      end="3000-09-10"
      class="mt-10"
    />

    <hr class="mt-10"/>
    <TimelineContainer
      controls
      start="-1000-01-30 15:30:22"
      end="3000-09-10"
      class="mt-10"
    />

    <TimelineContainer
      controls
      start="вчера"
      end="завтра"
      dateFormat="DD.MM HH:mm"
      streakFormat="DD.MM HH:mm"
      class="mt-10"
    />

    <hr class="mt-10"/>
    <TimelineContainer
      controls
      start="-1000-11-10"
      end="2000-09-10"
      class="mt-10"
    />
    <hr class="mt-10"/>
    <b class="mt-10">Disabled</b>
    <TimelineContainer
      controls
      disabled
      start="-1000-11-10"
      end="2000-09-10"
      class="mt-2"
    />
    <hr class="mt-10"/>
    <b class="mt-10">No controls</b>
    <TimelineContainer
      start="-1000-11-10"
      end="2000-09-10"
      class="mt-2"
    />
    <!-- <hr class="mt-10"/>
    <TimelineContainer
      controls
      end="5 января 2025 г. 15:12:13 до н.э."
      start="3000-09-10"
      class="mt-10"
    /> -->
  </div>
</template>

<script>
import TimelineContainer from '@/components/TimelineContainer'
export default {
  components: { TimelineContainer },
  name: 'App',
  data () {
    return {
      range: {
        end: -21371566632,
        start: -76752000491
      }
    }
  }
}
</script>
