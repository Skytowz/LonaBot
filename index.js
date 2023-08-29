const { createClient } = require('@supabase/supabase-js');
const { Client, Collection, GatewayIntentBits,  REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const SlashCommand = require('./utils/slashCommand');
const fs = require('fs');
const SlashOption = require('./utils/slashOption');

require('dotenv').config();


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
]});

Array.prototype.sample = function(){
    if(this.length == 1) return this[0];
    return this[Math.floor(Math.random()*this.length)];
}

client.on("rateLimit", data => {
    if (data.timeout > 1000) process.kill(1)
})


client.login(process.env.TOKEN);


client.commands = new Collection();

const commands = [];

const supabaseUrl = 'https://qbonrivuavznwaiwyttv.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey,{ auth: { persistSession: false } })
client.supabase = supabase;

(async () => {
    const { data: whens, error } = await supabase
        .from('MangaWhen')
        .select('*')
    const whenCommand = require("./Commandes/when"); 
    whens.forEach(when => {
        client.commands.set(when.slug,whenCommand);
        commands.push(new SlashCommand().setName(when.slug).setDescription(when.description))
    })
    const addCommand = require("./Commandes/addCommand");
    client.commands.set("add",addCommand);
    commands.push(new SlashCommand().setName("add").setDescription("Ajoute une commande").setOption(
        [
            new SlashOption("slug","Slug",ApplicationCommandOptionType.String,true),
            new SlashOption("texte","Texte",ApplicationCommandOptionType.String,true),
            new SlashOption("description","Description",ApplicationCommandOptionType.String,true)
        ]))

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

})();



fs.readdir("./Events/", (error, f) => {
    if(error) console.log(error);
    console.log(`${f.length} events en chargement`);

    f.forEach((f) =>{
        const events = require(`./Events/${f}`);
        const event = f.split(".")[0];

    client.on(event, events.bind(null, client));
    })
})