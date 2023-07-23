# PM2

pm2 start yarn --name nekometrics -- start

# Facebook

## Tasks & Notes
* Facebook App: https://developers.facebook.com/apps/1019997995017337/dashboard/?business_id=882949835138875
* **Provide a detailed step-by-step video walkthrough of how your app will use this permission**
* Insights on IG Users are only available on IG User accounts that have 100 or more followers.
* Metrics data is stored for 2 years.

## Exception: FriendlyError
This is a friendly error to show to the user, usually it's something that they should do, like they should connect to a service, or something like that. If a friendly error happens during a refresh, it will disable the widget, until the settings are changed again.

## Todo
- How to actually get follows and unfollows on Insta?

## Permissions

### instagram_basic
The instagram_basic allows your app to read an Instagram account profile's info and media. 

+ Widget which show followers (already)

### user_posts
The user_posts permission allows your app to access the posts that a user has made on their timeline. The allowed usage for this permission is to meaningfully improve the quality of a user's experience in your app.

+ Widget which lists 10 latest posts: 17841400505170734/media?fields=id,comments_count,like_count,media_url,timestamp,permalink&limit=100

### instagram_manage_insights
The instagram_manage_insights permission allows your app to get access to insights for the Instagram account linked to a Facebook Page. 

+ Widget which shows insight of latest post
7875551337904840/insights?metric=engagement,impressions,reach,saved

### read_insights
The read_insights permission allows your app to read the Insights data for Pages, apps and web domains the person owns.

+ https://developers.facebook.com/docs/graph-api/reference/page/insights

+ Widget which tracks the number of total likes of a Facebook page: 216572571776608/insights?date_preset=last_90d&period=day&metric=page_fans

### ads_read
The ads_read permission allows your app to access the Ads Insights API to pull Ads report information for Ad accounts you own or have been granted access to by the owner or owners of other ad accounts

+ List the ads account: me/adaccounts

+ Widget: Last 10 Ads with Photo, Spend, Impressions, Clicks: act_811043342659982/ads?fields=bid_amount,adlabels,effective_status,status,adcreatives{id,image_url,link_url,instagram_permalink_url,name},name,insights{clicks,conversions,spend,reach,outbound_clicks,impressions,objective,date_start,date_stop,cpc,cpm,cpp,ctr,cost_per_unique_click,cost_per_conversion}

+ Widget: Daily spending: act_811043342659982/insights?fields=spend&level=account&time_ranges=[{'since': '2020-10-10','until': '2020-10-10'}, {'since': '2020-10-09','until': '2020-10-09'}]

### user_videos
The user_videos permission allows your app to read a list of videos uploaded by a person. The allowed usage for this permission is to display a person's videos on a TV via a set-top box or in a digital photo frame.

### attribution_read
The attribution_read permission grants your app access to the Attribution API to pull attribution report data for lines of business you own or have been granted access to by the owner or owners of other lines of business.

### Instagram Public Content Access
The Instagram Public Content Access feature allows your app to access Instagram Graph API's Hashtag Search endpoints. 

# Oauth with Nekometrics

* Add Service
* Open Page for Oauth Service of Google, Facebook, etc
* Redirect (by the Oauth Service) on /oauth/{service}
* /oauth/{service} on the server-side calls the api/addService

# FAQ

## Adding Service

### Google Analytics

"Error: redirect_uri_mismatch"
Contact me.

### Facebook & Instagram

1. If there are no Facebook pages listed.

Need to have a look here:
https://www.facebook.com/settings?tab=business_tools&ref=settings

2. If there are no Instagram profiles listed.
A facebook page needs to exist, and to be linked to the Instagram Professional profile. Professional only means that statistics and API features will be available on your account.
https://www.facebook.com/business/help/898752960195806

3. If the Facebook service gets disconnected (it might happen when something major impacts your account, like a security issue, a password reset, etc), you can re-add your Facebook as a new service. That will update the old service.