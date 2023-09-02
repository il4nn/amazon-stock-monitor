import got from 'got'
import HTMLParser from 'node-html-parser'
import promptSync from 'prompt-sync'
import { Webhook, MessageBuilder } from 'discord-webhook-node'

const prompt = promptSync();

const hook = new Webhook("https://discord.com/api/webhooks/1147466722635427840/zq5YpkjWzm2-Yz49p18Tb6s-uBMsKz5LC_H9jH1srhYMe0JiHhZL_zOVuetrtnv-wf9V");
const embed = new MessageBuilder()
.setTitle('Amazon Monitor')
.setColor('#90EE90')
.setTimestamp();
 


async function monitor(productLink){

    var myheaders = {
        'connection': 'keep-alive',
        'set-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium"; v="91"',
        'sec-ch-ua-mobile': '?0',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'accept': 'text/html,application,/xhtml+xml,application/xml,;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec_fetch_mode':  'navigate',
        'sec-fetCh-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br',
        'rtt': 50,
        'ect': '4g',
        'downlink': 10
    };
    const response = await got(productLink, {
        headers : myheaders,
    });

    if(response && response.statusCode == 200){
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('#availability');

        if (availabilityDiv){
            let productName = productLink.substring(productLink.indexOf("fr/") + 3, productLink.indexOf("/dp"));
            let productImage = root.querySelector('#landingImage').getAttribute('src');
            let stockText = availabilityDiv.childNodes[1].innerText.toLowerCase();
            if (stockText == 'Actuellement indisponible'){
                console.log(productName + ': OUT OF OF STOCK');
            }else{
                embed.setThumbnail(productImage);
                embed.addField(productName,productLink,true);
                embed.addField('Availability', 'IN STOCK', false);
                hook.send(embed);
                console.log(productName + ': IN STOCK');

            }
        
        }
    }
    await new Promise(r => setTimeout(r,100000));
    monitor(productLink);
    return false;
}


async function run(){
    var productLink = prompt('Enter link to monitor (separate by a comma): ');
    var productLinkarr = productLink.split(',');

    for (var i = 0; i < productLinkarr.length;i++){
        productLinkarr[i] = productLinkarr[i].trim();
    }

    console.log(productLinkarr);

    var monitors = []
    productLinkarr.forEach(link => {
        var p = new Promise((resolve,reject) => {
            resolve(monitor(link));
        }).catch(err => console.log(err));
        monitors.push(p);
    })

    await Promise.allSettled(monitors);
}

run();