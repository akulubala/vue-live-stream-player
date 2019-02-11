<template>
<div id="playback-box" v-bind:style="{ width: video_box_width + 'px' }">
    <div v-bind:style="{ height: video_box_height + 'px' }">
      <video id="myPlayer" class="video-js vjs-default-skin"
          controls preload="none" :poster='playerPoster'
          :data-setup="JSON.stringify(playerSetup)">
        <source v-for="(source, i) in playerSource" :key="i" :src="source.src" :type="source.type">
      </video>
    </div>
    <div class="datepicker-trigger">
      <input
        type="text"
        id="datepicker-trigger"
        placeholder="选择日期"
        :value="formatDates(selectedDate)"
      >

      <AirbnbStyleDatepicker
        :trigger-element-id="'datepicker-trigger'"
        :mode="'single'"
        :fullscreen-mobile="true"
        :date-one="selectedDate"
        :enabled-dates="enabledDays"
        :inline="true"
        @date-one-selected="daySelected"
      />
    </div>
    <div id="visualization">
      <div class="menu">
          <input type="button" class="btn btn-white btn-sm btn-primary" @click="visZoomIn" value="放大"/>
          <input type="button" class="btn btn-white btn-sm btn-primary"  @click="visZoomOut" value="缩小"/>
          <input type="button" class="btn btn-white btn-sm btn-primary"  @click="visMoveLeft" value="向左"/>
          <input type="button" class="btn btn-white btn-sm btn-primary"  @click="visMoveRight" value="向右"/>
      </div>
    </div>
</div>
</template>
<script>
import videojs from 'video.js'
import vis from 'vis'
import { format, addDays } from 'date-fns'
export default {
  name: 'video-playback',
  props: {
    playerSetup: {
      type: Object,
      default: function() {
        return {
          aspectRatio: '640:400',
          playbackRates: [1, 1.5, 2]
        }
      }
    },
    playerPoster: {
      type: String,
      default: ''
    },
    playerSource: {
      type: Array,
      required: true,
      default: function() {
        return [
          {
            src:
              'http://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
            type: 'application/x-mpegURL'
          }
        ]
      }
    },
    selectableDates: {
      type: Array,
      required: true,
      default: function() {
        return []
      }
    }
  },
  computed: {
    video_box_width: function() {
      return this.playerSetup.aspectRatio.split(':')[0]
    },
    video_box_height: function() {
      return this.playerSetup.aspectRatio.split(':')[1]
    }
  },
  data() {
    return {
      dateFormat: 'YYYY-MM-DD',
      selectedDate: null,
      enabledDays: [],
      formatedDates: {},
      vis_data: [],
      time_line: null
    }
  },
  mounted() {
    window.playerEvents = this
    this.prepareDates()
    this.playerInitialize()
    this.playerSetupEvents()
  },
  beforeDestroy() {
    this.playerDispose()
  },
  methods: {
    prepareDates() {
      for (const item of this.selectableDates) {
        let selectable_day = format(item.start, 'YYYY-MM-DD')
        if (!this.formatedDates.hasOwnProperty(selectable_day)) {
          this.formatedDates[selectable_day] = []
        }
        if (!this.enabledDays.includes(selectable_day)) {
          this.enabledDays.push(selectable_day)
        }
        this.formatedDates[selectable_day].push({
          start: item.start,
          end: item.end
        })
      }
    },
    playerInitialize() {
      this.player = videojs('myPlayer', {
        html5: {
          hls: {
            withCredentials: false
          }
        }
      })
    },
    playerDispose() {
      this.player.dispose()
    },
    playerPlay() {
      this.player.play()
    },
    playerPause() {
      this.player.pause()
    },
    playerSetSrc(url) {
      this.player.src(url)
    },
    playerSetVolume(float) {
      this.player.volume(float)
    },
    playerSetPoster(url) {
      this.player.poster(url)
    },
    playerSetTime(time) {
      this.player.currentTime(time)
    },
    playerEventEnded() {
      console.log('ended')
    },
    playerEventVolume() {
      this.volume = this.player.volume()
    },
    playerEventError() {
      console.log(this.playerGetError())
    },
    playerGetPaused() {
      return this.player.paused()
    },
    playerGetTime() {
      return this.player.currentTime()
    },
    playerGetError() {
      return this.player.error().message
    },
    playerSetupEvents() {
      this.player.on('ended', function() {
        var a = window.playerEvents.playerEventEnded()
      })
      this.player.on('volumechange', function() {
        window.playerEvents.playerEventVolume()
      })
      this.player.on('error', function() {
        window.playerEvents.playerEventError()
      })
    },
    daySelected(day) {
      this.selectedDate = day
      if (this.formatedDates[day]) {
        var vis_results = []
        for (let i = 0; i < this.formatedDates[day].length; i++) {
          const element = this.formatedDates[day][i]
          vis_results.push({
            id: i,
            start: new Date(element.start),
            end: new Date(element.end),
            type: 'background'
          })
        }
      }
      this.loadVis(day, vis_results)
    },
    loadVis(day, vis_results) {
      let options = {
        height: '150px',
        min: new Date(day),
        max: addDays(day, 1),
        zoomMin: 1000,
        zoomMax: 1000 * 60 * 60 * 24,
        format: {
          minorLabels: {
            hour: 'H:mm'
          }
        },
        showMajorLabels: false,
        horizontalScroll: true
      }
      if (this.time_line !== null) {
        this.time_line.destroy()
      }
      this.time_line = new vis.Timeline(
        document.getElementById('visualization'),
        new vis.DataSet(vis_results),
        options
      )
      let currTime = new Date()
      this.time_line.addCustomTime(new Date(2012, 0, 1, 1, 30))
      this.time_line.on('click', event => {
        this.time_line.setCustomTime(event.time)
        this.$emit('play-video', event.time)
      })
    },
    visZoomIn() {
      this.time_line.zoomIn(0.4)
    },
    visZoomOut() {
      this.time_line.zoomOut(0.4)
    },
    visMoveLeft() {
      this.move(0.4)
    },
    visMoveRight() {
      this.move(-0.4)
    },
    move(percentage) {
      var range = this.time_line.getWindow()
      var interval = range.end - range.start

      this.time_line.setWindow({
        start: range.start.valueOf() - interval * percentage,
        end: range.end.valueOf() - interval * percentage
      })
    },
    formatDates(selectedDate) {
      let formattedDates = ''
      if (selectedDate) {
        formattedDates = format(selectedDate, this.dateFormat)
      }
      return formattedDates
    }
  }
}
</script>
<style lang="scss">
@import '~video.js/dist/video-js.min.css';
@import '~vis/dist/vis-timeline-graph2d.min.css';

a,
a:hover,
a:visited {
  color: #76daff;
}

.video-js .vjs-control-bar {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.menu {
  position: absolute;
  left: 0;
  margin: 10px;
  z-index: 9999;
}
.menu input {
  display: inline-block;
  margin: 2px;
  padding: 5px;
  cursor: pointer;
}
.datepicker-trigger {
  text-align: center;
  padding: 1em;
}
.btn-white.btn-primary {
  border-color: #8aafce;
  color: #6688a6 !important;
}
input {
  border: 1px solid #ccc;
  padding: 7px 0px;
  border-radius: 3px;
  padding-left: 5px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s,
    -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  display: none;
}
input:focus {
  border-color: #66afe9;
  outline: 0;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(102, 175, 233, 0.6);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(102, 175, 233, 0.6);
}
</style>

