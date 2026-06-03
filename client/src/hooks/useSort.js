import { createElement, useState, useMemo } from 'react'

export default function useSort(data, defaultKey = '', defaultDir = 'asc') {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState(defaultDir)

  const toggle = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const getVal = (obj, key) => {
        const keys = key.split('.')
        return keys.reduce((o, k) => o?.[k], obj) ?? ''
      }
      const va = getVal(a, sortKey)
      const vb = getVal(b, sortKey)
      const cmp = typeof va === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'az')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const SortIcon = ({ colKey }) => {
    const inactive = sortKey !== colKey
    const stroke = inactive ? '#cbd5e1' : '#00848e'
    const strokeWidth = inactive ? '2' : '2.5'
    const points = inactive
      ? ['8 9 12 5 16 9', '16 15 12 19 8 15']
      : [sortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9']

    return createElement(
      'svg',
      { width: '10', height: '10', fill: 'none', stroke, strokeWidth, viewBox: '0 0 24 24', style: { marginLeft: 4 } },
      points.map(point => createElement('polyline', { key: point, points: point }))
    )
  }

  return { sorted, toggle, sortKey, sortDir, SortIcon }
}
