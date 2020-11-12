import React, { Component } from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'
import { connect } from 'redaction'

@connect(({ pubsubRoom }) => ({ pubsubRoom }))
export default class Core extends Component<any, any> {

  state = {
    orders: [],
  }

  componentWillMount() {
    actions.core.getSwapHistory()
    SwapApp.shared().services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('remove order', this.updateOrders)
      .on('new order request', this.updateOrders)
    this.setPubsub()
  }

  componentWillUnmount() {
    SwapApp.shared().services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('remove order', this.updateOrders)
      .off('new order request', this.updateOrders)
    if (SwapApp.shared().services.room.connection) {
      console.log('leave room')
      SwapApp.shared().services.room.connection
        .removeListener('peer joined', actions.pubsubRoom.userJoined)
        .removeListener('peer left', actions.pubsubRoom.userLeft)
      SwapApp.shared().services.room.connection.leave()
    }
  }

  setPubsub = () => {
    const setupPubSubRoom = () => {
      try {
        const { pubsubRoom } = this.props

        if (pubsubRoom.isOnline) return

        if (!SwapApp.shared().services.room.connection) {
          throw new Error(`SwapRoom not ready`)
        }

        const isOnline = SwapApp.shared().services.room.connection.isOnline()
        const { peer } = SwapApp.shared().services.room

        this.updateOrders()

        actions.core.initPartialOrders()

        if (actions.core.hasHiddenOrders()) {
          actions.core.showMyOrders()
        }

        SwapApp.shared().services.room.connection
          .on('peer joined', actions.pubsubRoom.userJoined)
          .on('peer left', actions.pubsubRoom.userLeft)

        // BTC Multisign
        SwapApp.shared().services.room.on('btc multisig join', actions.btcmultisig.onUserMultisigJoin)

        clearInterval(pubsubLoadingInterval)

        actions.pubsubRoom.set({
          isOnline,
          peer,
        })
      } catch (error) {
        console.warn('pubsubRoom setup:', error)
      }
    }

    SwapApp.shared().services.room.on('ready', setupPubSubRoom)

    const pubsubLoadingInterval = setInterval(setupPubSubRoom, 5000)
  }

  updateOrders = () => {
    const orders = SwapApp.shared().services.orders.items
    this.setState(() => ({
      orders,
    }))
    actions.core.updateCore()
  }

  render() {
    return null
  }
}