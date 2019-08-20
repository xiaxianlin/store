import { useState, useEffect } from 'react'

type SubscriptionFn = (state: any) => void
type HandleFn = (nextState: any, prevState: any) => any
type CompareFn = (nextState: any, prevState: any) => boolean

interface StoreOptions {
    handle?: HandleFn
    compare?: CompareFn
}

/**
 * 创建一个状态存储对象
 * @param initState 初始状态
 */
function createStore() {
    let states: Map<string, any> = new Map()
    let handles: Map<string, HandleFn> = new Map()
    let compares: Map<string, CompareFn> = new Map()
    let subscriptions: Map<string, SubscriptionFn> = new Map()

    function getCompareFn(key: string): CompareFn {
        let defautFn: CompareFn = (nextState: any, prevState: any): boolean => !Object.is(nextState, prevState)
        return compares.get(key) || defautFn
    }

    function triggerOne(key: string, nextState: any, subscriptionFn?: SubscriptionFn) {
        let state = states.get(key)
        let handle = handles.get(key)
        let compareFn = getCompareFn(key)
        if (handle) {
            nextState = handle(nextState, state)
        }
        // 处理后返回undefined表示阻止更新
        if (handle && nextState === undefined) {
            return
        }
        // 前后两次值未发送变化
        if (!compareFn(nextState, state)) {
            return
        }
        // 处理订阅
        subscriptionFn = subscriptionFn || subscriptions.get(key)
        subscriptionFn && subscriptionFn(nextState)
        states.set(key, nextState)
    }

    function triggerAll(nextState: any) {
        subscriptions.forEach((fn: SubscriptionFn, key: string) => triggerOne(key, nextState, fn))
    }

    return {
        initState: (key: string, state: any, handle?: HandleFn) => {
            states.set(key, state)
            handle && handles.set(key, handle)
        },
        cleanState: (key: string) => {
            states.delete(key)
        },
        dispatch: (nextState: any, key?: string | Array<string>) => {
            if (typeof key === 'string') {
                triggerOne(key, nextState)
            } else if (Array.isArray(key)) {
                key.forEach(key => triggerOne(key, nextState))
            } else {
                triggerAll(nextState)
            }
        },
        subscription: (key: string, subscriptionFn: SubscriptionFn, compareFn?: CompareFn) => {
            subscriptions.set(key, subscriptionFn)
            compareFn && compares.set(key, compareFn)
            return () => {
                subscriptions.delete(key)
                compareFn && compares.delete(key)
            }
        },
        getState: (key: string): any => {
            return states.get(key)
        }
    }
}

const store = createStore()

/**
 * 状态存储hooks
 * @param key 存储关键字，唯一
 * @param store 状态存储对象
 */
export function useStore(key: string, initState: any, options: StoreOptions = {}) {
    /**
     * 派发状态
     * @param state 下一个状态
     * @param key 存储关键字
     */
    function dispatch(state: any, keys?: string | Array<string>) {
        store.dispatch(state, keys)
    }
    let [state, setState] = useState(initState)
    useEffect(() => {
        store.initState(key, initState, options.handle)
        return () => store.cleanState(key)
    }, [])
    useEffect(() => {
        let unsubscription = store.subscription(key, (state: any) => setState(state), options.compare)
        return () => unsubscription()
    })
    return [state, dispatch]
}

/**
 * 对外提供store接口
 */
export function getStore() {
    return {
        getState: store.getState,
        dispatch: store.dispatch
    }
}
