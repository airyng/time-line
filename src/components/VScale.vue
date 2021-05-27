<template>
  <div>
    <div v-if="!error" class="timeline">
      <div v-show="controls" class="timeline__blind" :style="leftBlindWidth"></div>
      <div
        v-show="controls"
        ref="picker"
        class="timeline__picker"
        :class="{ disabled }"
        :style="pickerStyle"
      >
        <div ref="pickerCornerL" class="timeline__picker__corner"></div>
        <div ref="pickerWindow" class="timeline__picker__window"></div>
        <div ref="pickerCornerR" class="timeline__picker__corner"></div>
      </div>
      <div v-show="controls" class="timeline__blind timeline__blind--right" :style="rightBlindWidth"></div>

      <div v-if="dateSteps && dateSteps.length" class="timeline__streaks">
        <div
          v-for="(step, i) in dateSteps"
          :key="step.unix"
          class="timeline__streak"
          :class="{ 'd-none': dateSteps.length > 2 && (i === 0 || i === dateSteps.length -1)}"
          :style="`left: ${100 / (dateSteps.length -1) * (i)}%;`"
        >{{step.humanFormat}}</div>  
      </div>
    </div>
    <div v-else>
      <p class="error">{{error}}</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { defineDateFormat, convertAnyDateToUnix, getValueBetweenRange, getPercent } from '@/utils'
import { manager as beManager } from '@/utils/browserEventsManager'

export default {
  props: {
    start: { type: String, default: '0' },
    end: { type: String, default: '100' },
    controls: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minPickerWindowWidth: { type: String, default: '50' },
    dateFormat: { type: String, default: null },
    value: { type: Object, default: null },
    streakFormat: { type: String, default: 'DD.MM.YYYY' }
  },
  data () {
    return {
      forceRecomputeCounter: 0,
      picker: null,
      pickerWidth: 500,
      curPickerPos: 0,
      lastPickerPos: 0,
      error: null,
      range: {},
      beManager
    }
  },
  computed: {
    dateSteps () {
      this.forceRecomputeCounter
      let stepsCount = 9
      const windowWidth = window.innerWidth
      if (windowWidth <= 1200) { stepsCount = 7 }
      if (windowWidth <= 1000) { stepsCount = 5 }
      if (windowWidth <= 800) { stepsCount = 3 }
      if (windowWidth <= 500) { stepsCount = 2 }

      const dateDiff = this.endDateUnix - this.startDateUnix
      const timeStep = dateDiff / stepsCount

      const stepsArray = []
      let nStep = this.startDateUnix
      do {
        stepsArray.push({ unix: nStep, humanFormat: moment.unix(nStep).format(this.streakFormat) })
        nStep += timeStep
      } while (nStep <= this.endDateUnix)
      return stepsArray
    },
    startDate () {
      return moment.unix(convertAnyDateToUnix(this.start))
    },
    endDate () {
      return moment.unix(convertAnyDateToUnix(this.end))
    },
    startDateUnix () {
      const result = convertAnyDateToUnix(this.start)
      // console.log('moment start', moment(result).format('DD.MM.YYYY'))
      return result
    },
    endDateUnix () {
      return convertAnyDateToUnix(this.end)
    },
    pickerStyle () {
      return this.pickerPositions + ` width: ${this.pickerWidth}px`
    },
    pickerPositions () {
      return `left: ${this.curPickerPos}px; right: auto;`
    },
    leftBlindWidth () {
      return `width: ${this.curPickerPos}px;`
    },
    rightBlindWidth () {
      this.forceRecomputeCounter
      const parentWidth = this.$refs.picker?.parentNode?.clientWidth || 0
      const width = parentWidth - this.pickerWidth - this.curPickerPos
      return `width: ${width}px;`
    }
  },
  watch: {
    startDateUnix () {
      this.validateDates()
    },
    endDateUnix () {
      this.validateDates()
    }//,
    // value (newVal) {
    //   if (newVal?.start && newVal?.end && (newVal.start !== this.range.start || newVal.end !== this.range.start)) {
    //     this.reinit(false)
    //     // this.setPickerVals(newVal.start, newVal.end)
    //   }
    // }
  },
  mounted () {
    this.beManager = beManager()
    this.beManager.addEvent('vscale', window, 'resize', this.reinit)
    this.init()
  },
  methods: {
    init (doCaclulate = true) {
      this.picker = this.$refs.picker
      this.validateDates()
      this.windowSwipeInit()
      this.cornerSwipeInit(this.$refs.pickerCornerL, 'L')
      this.cornerSwipeInit(this.$refs.pickerCornerR, 'R')
      
      if (this.value?.start && this.value?.end) {
        this.setPickerVals(this.value.start, this.value.end)
      }

      if(!this.controls) { // maximize picker window
        this.pickerWidth = this.$refs.picker.parentNode.clientWidth
      }
      // To initiate recalc computed props do next
      setTimeout(()=>{ this.forceRecomputeCounter++ }, 0)
      
      if (doCaclulate) {
        this.calculate()
      }
    },
    reinit () {
      this.destroyEvents()
      this.init(false)
    },
    setPickerVals(start, end) {
      // console.log(start,end)
      let startPercent = getPercent(this.startDateUnix, this.endDateUnix, start)
      // if (startPercent < 0) { startPercent = startPercent }
      const startCornerOffset = (this.$refs.picker.parentNode.clientWidth / 100) * startPercent

      const endPercent = getPercent(this.startDateUnix, this.endDateUnix, end)
      const endCornerOffset = (this.$refs.picker.parentNode.clientWidth / 100) * endPercent
      const pickerWidth = endCornerOffset - startCornerOffset

      this.pickerWidth = pickerWidth
      this.lastPickerPos = 0
      this.movePicker((startCornerOffset) * -1)
      this.forceRecomputeCounter++
    },
    validateDates () {
      if (this.startDateUnix >= this.endDateUnix) {
        this.error = 'Дата начала не может равняться или быть больше даты окончания'
        console.error(this.error)
        return false
      }
      return true
    },
    calculate (update = true) {
      const start = this.curPickerPos
      const end = this.curPickerPos + this.pickerWidth
      const maxWidth = this.$refs.picker.parentNode.clientWidth
      const startPercent = 100 / (maxWidth / start)
      const endPercent = 100 / (maxWidth / end)
      const startResult = getValueBetweenRange(this.endDateUnix, this.startDateUnix, startPercent)
      const endResult = getValueBetweenRange(this.endDateUnix, this.startDateUnix, endPercent)
      if (update) {
        this.returnValue(startResult, endResult)
      }
      this.range = {start: startResult, end: endResult}
    },
    returnValue (startResult, endResult) {
      const dateFormat = this.dateFormat || defineDateFormat(this.start)
      const humanDatesArr = [
        moment.unix(startResult).format(dateFormat),
        moment.unix(endResult).format(dateFormat)
      ]
      for (let index = 0; index < humanDatesArr.length; index++) {
        humanDatesArr[index] = humanDatesArr[index]
          .replace('BC', 'до н.э.')
          .replace('AD', 'н.э.')
        
        if(!this.dateFormat) {
          humanDatesArr[index] = humanDatesArr[index].replace('-', '')
        }
      }
      if (!this.value || this.value.start !== startResult || this.value.end !== endResult || !this.value.humanFormat) {
        this.$emit('input',
          {
            start: startResult,
            end: endResult,
            humanFormat: {
              start: humanDatesArr[0],
              end: humanDatesArr[1]
            }
          }
        )
      }
    },
    cornerSwipeInit (cornerRef, cornerSide) {
      if (!this.picker || !cornerRef) {
        console.error('VScale component: something went wrong while corner initialization.')
        return
      }

      const containerKey = 'cornerSwipe' + (cornerSide ? '_r' : '')
      this.beManager.addEvent(containerKey, cornerRef, 'touchstart', startTouch)
      this.beManager.addEvent(containerKey, cornerRef, 'mousedown', startTouch)
      this.beManager.addEvent(containerKey, document.body, 'mousemove', moveTouch)
      this.beManager.addEvent(containerKey, document.body, 'touchmove', moveTouch)
      this.beManager.addEvent(containerKey, document.body, 'mouseup', stopTouch)
      this.beManager.addEvent(containerKey, document.body, 'touchend', stopTouch)
      
      const that = this
      var initialX = null
      let isMoving = false

      function startTouch(e) {
        const coords = that.getPointerCoords(e)
        initialX = coords.x
        isMoving = true
        if (cornerSide === 'R') {
          that.lastPickerPos = that.curPickerPos
        }
      }

      function moveTouch(e) {
        if (initialX === null) { return }
        if (!isMoving) { return }

        const coords = that.getPointerCoords(e)
        var currentX = coords.x

        var diffX = initialX - currentX
       
        that.scalePicker(diffX, cornerSide === 'R')
        initialX = currentX
      }
      
      function stopTouch () {
        isMoving = false
        initialX = null
        that.calculate()
      }
    },
    windowSwipeInit () {
      this.pickerWindow = this.$refs.pickerWindow
      if (!this.picker || !this.pickerWindow) {
        console.error('VScale component: something went wrong while window initialization.')
        return
      }

      this.beManager.addEvent('windowSwipe', this.pickerWindow, 'touchstart', startTouch)
      this.beManager.addEvent('windowSwipe', this.pickerWindow, 'mousedown', startTouch)
      this.beManager.addEvent('windowSwipe', document.body, 'mousemove', moveTouch)
      this.beManager.addEvent('windowSwipe', document.body, 'touchmove', moveTouch)
      this.beManager.addEvent('windowSwipe', document.body, 'mouseup', stopTouch)
      this.beManager.addEvent('windowSwipe', document.body, 'touchend', stopTouch)

      const that = this
      var initialX = null
      let isMoving = false

      function startTouch(e) {
        const coords = that.getPointerCoords(e)
        initialX = coords.x
        that.lastPickerPos = that.curPickerPos
        isMoving = true
      }

      function moveTouch(e) {
        if (initialX === null) { return }
        if (!isMoving) { return }

        const coords = that.getPointerCoords(e)
        var currentX = coords.x

        var diffX = initialX - currentX

        that.movePicker(diffX)
      }

      function stopTouch () {
        isMoving = false
        initialX = null
        that.calculate()
      }
    },
    getPointerCoords (e) {
      const coords = { x: 0, y: 0 }
      if (e.touches) {
        coords.x = e.touches[0].clientX
        coords.y = e.touches[0].clientY
      } else {
        coords.x = e.clientX
        coords.y = e.clientY
      }
      return coords
    },
    scalePicker (movedDistance, isRightSide = false) {
      const minPickerWW = parseInt(this.minPickerWindowWidth)
      if (isRightSide) {
        const maxOffset = this.$refs.picker.parentNode.clientWidth - this.pickerWidth
        if (this.curPickerPos >= maxOffset && movedDistance < 0) { return }
        this.pickerWidth += movedDistance * -1
      } else {
        if (this.curPickerPos <= 0 && movedDistance > 0) { return }
        if (movedDistance < 0 && this.pickerWidth <= minPickerWW) { return }
        this.pickerWidth += movedDistance
        this.lastPickerPos = this.curPickerPos
        this.movePicker(movedDistance)
      }
      if (this.pickerWidth < minPickerWW) {
        this.pickerWidth = minPickerWW
      }
    },
    movePicker (movedDistance) {
      const newPos = (-1 * movedDistance) + this.lastPickerPos
      const maxOffset = this.$refs.picker.parentNode.clientWidth - this.pickerWidth
      if (newPos < 0) {
        this.curPickerPos = 0
      } else if (newPos > maxOffset) {
        this.curPickerPos = maxOffset
      } else {
        this.curPickerPos = newPos
      }
    },
    destroyEvents () {
      this.beManager.removeAllEvents('cornerSwipe')
      this.beManager.removeAllEvents('cornerSwipe_r')
      this.beManager.removeAllEvents('windowSwipe')
    }
  },
  beforeDestroy () {
    this.destroyEvents()
  }
}
</script>

<style lang="sass" scoped>
@import '../assets/variables.sass'
.timeline
  width: 100%
  height: 60px
  background: #f7f3e9
  border-radius: $borderRadVal
  position: relative
  display: flex
  overflow: hidden
.timeline__blind
  position: absolute
  background: rgba(0, 0, 0, 0.2)
  left: 0
  right: auto
  height: 100%
  z-index: 1
  border-radius: $borderRadVal 0 0 $borderRadVal
.timeline__blind--right
  left: auto
  right: 0
  border-radius: 0 $borderRadVal $borderRadVal 0

.timeline__picker
  position: absolute
  top: 0
  bottom: 0
  height: 100%
  z-index: 2
  display: flex
  flex-direction: row
.timeline__picker__window
  background-color: transparent
  flex: 1 0
  cursor: grab
.timeline__picker__corner
  width: 15px
  height: 100%
  background-color: #808080a8
  cursor: col-resize
.timeline__streaks
  width: 100%
  position: relative
  z-index: 0
.timeline__streak
  position: absolute
  height: 20px
  bottom: 15px
  transform: translateX(-50%)
  &::after
    content: ''
    position: relative
    left: 50%
    width: 0px
    bottom: -5px
    height: 12px
    border: 1px solid red
    display: block
</style>