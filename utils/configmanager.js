import fs from 'fs'
import path from 'path'

console.log('initializing the config path')

const configPath = 'config.json'
const premiumPath = 'db.json'

let config = {}

if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        console.log('config file read successful!')
    } catch (e) {
        console.log('error reading config.json')
        config = { users: {} }
    }
} else {
    console.log('config file not found')
    config = { users: {} }
}

const saveConfig = () => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log('config saved')
}

let premiums = {}

if (fs.existsSync(premiumPath)) {
    try {
        premiums = JSON.parse(fs.readFileSync(premiumPath, 'utf-8'))
        console.log('premium file loaded successfully!')
    } catch (e) {
        console.log('error reading db.json')
        premiums = { users: {} }
    }
} else {
    console.log('db.json not found')
    premiums = { users: {} }
}

const savePremium = () => {
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2))
    console.log('premium saved')
}

export default {
    config,
    premiums,
    save: saveConfig,
    saveP: savePremium
}