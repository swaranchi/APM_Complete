import React, { useEffect, useState } from 'react'
import { api } from '../../api'
import Toast from '../../Toast.jsx'
import { encryptItem } from '../../crypto.js'

export default function Vault(){
  const [items,setItems]=useState([])
  const [showAdd,setShowAdd]=useState(false)
  const [name,setName]=useState('')
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [target,setTarget]=useState('')
  const [err,setErr]=useState(null)
  const [ok,setOk]=useState(null)

  async function load(){
    const r = await api('/vault')
    setItems(r.items || [])
  }
  useEffect(()=>{ load() },[])

  async function add(e){
    e.preventDefault()
    setErr(null); setOk(null)

    const master = sessionStorage.getItem('apm_master')
    if(!master) return setErr("Master password missing. Please login again.")

    try{
      const encrypted = await encryptItem(master, { username, password })
      await api('/vault', {
        method:'POST',
        body: JSON.stringify({
          name, target,
          encrypted_blob: encrypted.encrypted_blob,
          enc_iv: encrypted.enc_iv,
          kdf_params: encrypted.kdf_params
        })
      })
      setOk("Item added to vault.")
      setShowAdd(false)
      setName(''); setUsername(''); setPassword(''); setTarget('')
      load()
    }catch(e){ setErr(e.message) }
  }

  return (
    <div className="space-y-4">
      <Toast msg={err} type="error" onClose={()=>setErr(null)} />
      <Toast msg={ok} type="success" onClose={()=>setOk(null)} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Vaults</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                onClick={()=>setShowAdd(true)}>
          + Add Item
        </button>
      </div>

      {/* Vault Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Target</th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.entry_id} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3">{it.target || "—"}</td>
              </tr>
            ))}
            {!items.length && <tr><td className="p-6 text-center text-gray-500" colSpan="2">No items yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">Add Vault Item</h3>
            <form className="space-y-4" onSubmit={add}>
              <input className="w-full border rounded-lg px-4 py-3" placeholder="Entry Name" value={name} onChange={e=>setName(e.target.value)} />
              <input className="w-full border rounded-lg px-4 py-3" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
              <input type="password" className="w-full border rounded-lg px-4 py-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
              <input className="w-full border rounded-lg px-4 py-3" placeholder="Target (optional)" value={target} onChange={e=>setTarget(e.target.value)} />
              
              <div className="flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded-lg bg-gray-200" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
