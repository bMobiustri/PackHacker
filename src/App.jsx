import { useState, useMemo, useCallback } from 'react'

const PACKING_DATA = {
  clothing: {
    label: 'Clothing',
    base: ['Underwear', 'Socks', 'T-shirts', 'Pants/jeans', 'Pajamas', 'Comfortable shoes'],
    hot: ['Shorts', 'Tank tops', 'Sunglasses', 'Sandals', 'Swimsuit', 'Light dress/shirt'],
    mild: ['Light jacket', 'Long-sleeve shirts', 'Jeans', 'Sneakers'],
    cold: ['Heavy coat', 'Thermal underwear', 'Wool socks', 'Gloves', 'Beanie/hat', 'Scarf', 'Boots', 'Sweaters/fleece'],
    business: ['Dress shirts', 'Dress pants/skirt', 'Blazer', 'Dress shoes', 'Belt', 'Tie/accessories'],
    outdoors: ['Hiking boots', 'Quick-dry pants', 'Moisture-wicking shirts', 'Rain jacket', 'Hat/cap', 'Extra socks'],
  },
  tech: {
    label: 'Tech & Gadgets',
    base: ['Phone charger', 'Portable battery pack'],
    business: ['Laptop', 'Laptop charger', 'Presentation adapter/dongle', 'Mouse', 'Earbuds/headphones'],
    outdoors: ['Headlamp/flashlight', 'Portable speaker'],
    airplane: ['Noise-canceling headphones', 'Tablet/e-reader'],
    general: ['Camera', 'Watch charger'],
  },
  toiletries: {
    label: 'Toiletries',
    base: ['Toothbrush', 'Toothpaste', 'Deodorant', 'Shampoo', 'Body wash', 'Face wash', 'Moisturizer', 'Medications'],
    hot: ['Sunscreen (SPF 50+)', 'Aloe vera gel', 'Insect repellent', 'Lip balm with SPF'],
    cold: ['Heavy moisturizer', 'Lip balm', 'Hand cream'],
    airplane: ['Travel-size containers (<100ml)', 'Quart zip bag for liquids'],
    outdoors: ['Sunscreen', 'Insect repellent', 'Hand sanitizer', 'First aid kit', 'Blister bandages'],
    general: ['Hair products', 'Razor', 'Contact lenses/solution', 'Nail clippers'],
  },
  documents: {
    label: 'Documents & Essentials',
    base: ['ID/Driver\'s license', 'Credit/debit cards', 'Cash', 'Health insurance card'],
    airplane: ['Passport', 'Boarding pass', 'TSA PreCheck/Global Entry card', 'Travel insurance docs'],
    business: ['Business cards', 'Meeting agenda/notes', 'Company badge', 'Expense report forms'],
    outdoors: ['Trail maps', 'Park passes/permits', 'Emergency contacts list'],
    general: ['Hotel confirmation', 'Car rental confirmation', 'Itinerary printout'],
  },
  gear: {
    label: 'Outdoor Gear',
    outdoorsOnly: true,
    base: [],
    outdoors: ['Daypack/backpack', 'Water bottle', 'Snacks/energy bars', 'Pocket knife/multi-tool', 'Dry bags', 'Trekking poles', 'Sunglasses (sport)'],
    cold: ['Hand warmers', 'Insulated water bottle'],
    hot: ['Cooling towel', 'Electrolyte packets'],
  },
  anna: {
    label: 'For Anna',
    annaOnly: true,
    base: ['Anna\'s phone charger', 'Shared snacks she likes', 'Her favorite travel pillow', 'Extra tote bag for her stuff'],
  },
  misc: {
    label: 'Miscellaneous',
    base: ['Reusable water bottle', 'Snacks', 'Laundry bag', 'Packing cubes'],
    airplane: ['Neck pillow', 'Eye mask', 'Earplugs', 'Empty water bottle (fill after security)', 'Gum/mints'],
    long: ['Laundry detergent packets', 'Extra bag for souvenirs/dirty clothes', 'Stain remover pen'],
    general: ['Umbrella', 'Tote bag/day bag', 'Ziploc bags'],
  },
}

function generatePackingList(config) {
  const { climate, days, airplane, business, outdoors, withAnna } = config
  const categories = []

  for (const [key, cat] of Object.entries(PACKING_DATA)) {
    if (cat.outdoorsOnly && !outdoors) continue
    if (cat.annaOnly && !withAnna) continue

    const items = new Set()

    if (cat.base) cat.base.forEach(i => items.add(i))
    if (cat[climate]) cat[climate].forEach(i => items.add(i))
    if (airplane && cat.airplane) cat.airplane.forEach(i => items.add(i))
    if (business && cat.business) cat.business.forEach(i => items.add(i))
    if (outdoors && cat.outdoors) cat.outdoors.forEach(i => items.add(i))
    if (cat.general) cat.general.forEach(i => items.add(i))
    if (days > 5 && cat.long) cat.long.forEach(i => items.add(i))

    const finalItems = [...items].map(item => {
      if (key === 'clothing') {
        if (['Underwear', 'Socks', 'T-shirts'].includes(item))
          return `${item} (×${Math.min(days + 1, 10)})`
        if (['Pants/jeans'].includes(item))
          return `${item} (×${Math.min(Math.ceil(days / 2), 5)})`
      }
      return item
    })

    if (finalItems.length > 0) {
      categories.push({ key, label: cat.label, items: finalItems })
    }
  }

  return categories
}

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 8,
        border: selected ? '2px solid #7c9aff' : '2px solid #333',
        background: selected ? '#1a2744' : '#1a1a1a',
        color: selected ? '#7c9aff' : '#999',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}

function ToggleButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 8,
        border: active ? '2px solid #7c9aff' : '2px solid #333',
        background: active ? '#1a2744' : '#1a1a1a',
        color: active ? '#7c9aff' : '#999',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        transition: 'all 0.15s ease',
        minWidth: 80,
      }}
    >
      {label}
    </button>
  )
}

export default function App() {
  const [step, setStep] = useState('config')
  const [climate, setClimate] = useState('mild')
  const [days, setDays] = useState(3)
  const [airplane, setAirplane] = useState(false)
  const [business, setBusiness] = useState(false)
  const [outdoors, setOutdoors] = useState(false)
  const [withAnna, setWithAnna] = useState(false)
  const [checked, setChecked] = useState({})
  const [copyFeedback, setCopyFeedback] = useState(false)

  const config = useMemo(() => ({ climate, days, airplane, business, outdoors, withAnna }), [climate, days, airplane, business, outdoors, withAnna])
  const packingList = useMemo(() => generatePackingList(config), [config])

  const totalItems = useMemo(() => packingList.reduce((s, c) => s + c.items.length, 0), [packingList])
  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked])

  const toggleItem = useCallback((item) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }))
  }, [])

  const handleGenerate = () => {
    setChecked({})
    setStep('list')
  }

  const exportText = useMemo(() => {
    let text = `Packing List — ${days} day${days !== 1 ? 's' : ''}, ${climate} climate\n`
    const tags = []
    if (airplane) tags.push('flight')
    if (business) tags.push('business')
    if (outdoors) tags.push('outdoors')
    if (withAnna) tags.push('with Anna')
    if (tags.length) text += `(${tags.join(', ')})\n`
    text += '\n'

    for (const cat of packingList) {
      text += `${cat.label}\n`
      for (const item of cat.items) {
        const isChecked = checked[`${cat.key}-${item}`]
        text += `- [${isChecked ? 'x' : ' '}] ${item}\n`
      }
      text += '\n'
    }
    return text.trim()
  }, [packingList, checked, days, climate, airplane, business, outdoors, withAnna])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = exportText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  if (step === 'config') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>PackHacker</h1>
        <p style={styles.subtitle}>Smart packing lists for every trip</p>

        <div style={styles.section}>
          <label style={styles.label}>How many days?</label>
          <div style={styles.daysRow}>
            {[1, 2, 3, 4, 5, 7, 10, 14].map(d => (
              <OptionButton key={d} label={d} selected={days === d} onClick={() => setDays(d)} />
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Climate</label>
          <div style={styles.row}>
            {[['hot', 'Hot'], ['mild', 'Mild'], ['cold', 'Cold']].map(([val, lbl]) => (
              <OptionButton key={val} label={lbl} selected={climate === val} onClick={() => setClimate(val)} />
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Trip details</label>
          <div style={styles.row}>
            <ToggleButton label="✈ Airplane" active={airplane} onClick={() => setAirplane(!airplane)} />
            <ToggleButton label="💼 Business" active={business} onClick={() => setBusiness(!business)} />
            <ToggleButton label="🏔 Outdoors" active={outdoors} onClick={() => setOutdoors(!outdoors)} />
            <ToggleButton label="👫 With Anna" active={withAnna} onClick={() => setWithAnna(!withAnna)} />
          </div>
        </div>

        <button onClick={handleGenerate} style={styles.generateBtn}>
          Generate Packing List
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => setStep('config')} style={styles.backBtn}>← Back</button>
        <h1 style={{ ...styles.title, fontSize: 22, margin: 0 }}>PackHacker</h1>
        <button onClick={handleCopy} style={styles.copyBtn}>
          {copyFeedback ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      <div style={styles.progress}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }} />
        </div>
        <span style={styles.progressText}>{checkedCount}/{totalItems} packed</span>
      </div>

      <div style={styles.summary}>
        {days} day{days !== 1 ? 's' : ''} · {climate}
        {airplane ? ' · flight' : ''}
        {business ? ' · business' : ''}
        {outdoors ? ' · outdoors' : ''}
        {withAnna ? ' · with Anna' : ''}
      </div>

      {packingList.map(cat => (
        <div key={cat.key} style={styles.category}>
          <h2 style={styles.catTitle}>{cat.label}</h2>
          {cat.items.map(item => {
            const id = `${cat.key}-${item}`
            const isChecked = !!checked[id]
            return (
              <div
                key={id}
                onClick={() => toggleItem(id)}
                style={{
                  ...styles.item,
                  opacity: isChecked ? 0.45 : 1,
                  textDecoration: isChecked ? 'line-through' : 'none',
                }}
              >
                <div style={{
                  ...styles.checkbox,
                  background: isChecked ? '#7c9aff' : 'transparent',
                  borderColor: isChecked ? '#7c9aff' : '#555',
                }}>
                  {isChecked && <span style={{ fontSize: 12, color: '#0a0a0a' }}>✓</span>}
                </div>
                <span>{item}</span>
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
        <button onClick={handleCopy} style={styles.copyBtnLarge}>
          {copyFeedback ? '✓ Copied to clipboard!' : 'Copy list to clipboard'}
        </button>
        <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
          Paste into Apple Notes — checkboxes will auto-convert
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e0e0e0',
    minHeight: '100vh',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    margin: '0 0 32px',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 500,
  },
  row: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  daysRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  generateBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    background: '#7c9aff',
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#7c9aff',
    fontSize: 14,
    cursor: 'pointer',
    padding: '4px 0',
  },
  copyBtn: {
    background: '#1a2744',
    border: '1px solid #333',
    color: '#7c9aff',
    fontSize: 13,
    cursor: 'pointer',
    padding: '6px 14px',
    borderRadius: 6,
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#7c9aff',
    borderRadius: 3,
    transition: 'width 0.2s ease',
  },
  progressText: {
    fontSize: 13,
    color: '#888',
    whiteSpace: 'nowrap',
  },
  summary: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  category: {
    marginBottom: 24,
  },
  catTitle: {
    fontSize: 14,
    color: '#7c9aff',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px',
    paddingBottom: 6,
    borderBottom: '1px solid #1a1a1a',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    cursor: 'pointer',
    borderBottom: '1px solid #141414',
    fontSize: 15,
    transition: 'opacity 0.15s ease',
    userSelect: 'none',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: '2px solid #555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  copyBtnLarge: {
    padding: '12px 32px',
    borderRadius: 8,
    border: '1px solid #333',
    background: '#1a2744',
    color: '#7c9aff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
}
