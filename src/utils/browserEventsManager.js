
const manager = {
  state: {},
  removeAllEvents (containerKey) {
    if (!this.state[containerKey] || typeof this.state[containerKey] !== 'object') return false
    const eventObj = this.state[containerKey]
    for (let index = 0; index < eventObj.length; index++) {
      const el = eventObj[index];
      el.element.removeEventListener(el.eventKey, el.callback, false);
    }
    this.state[containerKey] = []
  },
  addEvent (containerKey, element, eventKey, callback) {
    element.addEventListener(eventKey, callback, false)
    if (this.state[containerKey]) {
      this.state[containerKey].push(
        { eventKey, element, callback }
      )
    } else {
      this.state[containerKey] = [
        { eventKey, element, callback }
      ]
    }
  }
}

export default manager