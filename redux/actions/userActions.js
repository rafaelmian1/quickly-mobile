import axios from 'axios'
const HOST = 'https://quickly-food.herokuapp.com'
import AsyncStorage from '@react-native-async-storage/async-storage';

const userActions = {
  createUser: (user, props) => {
    return async (dispatch) => {
      try {
        let res = await axios.post(`${HOST}/api/user/signUp`, user)
        console.log(res.data)
        if (res.data.success) {
          const { user, userData, token } = res.data
          await AsyncStorage.setItem('token', token)
          dispatch({
            type: 'LOG_IN',
            payload: { user, userData, token },
          })
          return res.data
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  logUser: (user, props) => {
    return async (dispatch) => {
      try {
        let res = await axios.post(`${HOST}/api/user/logIn`, { ...user })
        if (res.data.success) {
          const { user, userData, token } = res.data
          await AsyncStorage.setItem('token', token)
          dispatch({
            type: 'LOG_IN',
            payload: { user, userData, token },
          })
          return res.data
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  logOut: () => {
    console.log('entro')
    return async (dispatch) => {
      await AsyncStorage.clear()
      return dispatch({ type: 'LOG_OUT' })
    }
  },
  verifyToken: (token) => {
    return async (dispatch) => {
      try {
        let response = await axios.get(`${HOST}/api/user/token`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        dispatch({
          type: 'LOG_IN',
          payload: { ...response.data, token },
        })
      } catch (error) {
        console.log(error)
        // return dispatch({ type: 'LOG_OUT' })
      }
    }
  },
  manageCart: (body) => {
    return async (dispatch) => {
      console.log(body)
      let token = localStorage.getItem('token')
      if (!token) {
        let cart = JSON.parse(localStorage.getItem('cart'))
        localStorage.setItem('cart', cart ? JSON.stringify([...cart, body.cartItem]) : JSON.stringify([body.cartItem]))
      } else {
        try {
          let response = await axios.put(`${HOST}/api/products`, body)
          if (!response?.data?.success) throw new Error('Algo salió mal')
          return dispatch({
            type: 'HANDLE_CART',
            payload: response.data.userData,
          })
        } catch (error) {
          console.log(error)
        }
      }
    }
  },
  favHandler: (body) => {
    return async (dispatch) => {
      let token = localStorage.getItem('token')
      try {
        let response = await axios.put(`${HOST}/api/products/favs`, body, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        if (!response?.data?.success) throw new Error('Algo salió mal')
        dispatch({
          type: 'GET_PRODUCTS',
          payload: response.data.response,
        })
        return response?.data?.success
      } catch (error) {
        console.log(error)
      }
    }
  },
  updateUser: ({ action, userData, fileImg, currentPassword, password, newPaymentCard, paymentCardId, newAddress, addressId }) => {
    return async (dispatch) => {
      let token = localStorage.getItem('token')
      let body = fileImg || {
        action,
        userData,
        currentPassword,
        password,
        newPaymentCard,
        paymentCardId,
        newAddress,
        addressId,
      }
      try {
        let res = await axios.put(`${HOST}/api/user`, body, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        return dispatch({
          type: 'LOG_IN',
          payload: { ...res.data, token, keep: true },
        })
      } catch (error) {
        console.log(error)
        // return dispatch({ type: 'LOG_OUT' })
      }
    }
  },
}

export default userActions
