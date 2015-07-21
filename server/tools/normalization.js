
function Profile(provider){
    this.provider = provider;
}

function Friend(provider){
    this.provider = provider;
}


function parseProfilePicture(userProfile){
    return (userProfile.picture?userProfile.picture.data.url:undefined) ||
        userProfile.profile_image_url;
}

function parseProfileLink(userProfile){
    return userProfile.link ||
        (userProfile.screen_name?"https://twitter.com/" + userProfile.screen_name:undefined);
}

function parseProfileLanguage(userProfile){
    return (userProfile.locale?userProfile.locale.substring(0,2):undefined) ||
        userProfile.lang;
}

function parseFriendPicture(friendData){
    return (friendData.picture?friendData.picture.data.url:undefined) ||
        friendData.profile_image_url_https;
}

module.exports = function(){

    return {
        normalizeProfile : function (provider, userProfile){
            var profile = new Profile(provider);

            // common profile properties
            profile.id= userProfile.id;
            profile.name = userProfile.name;
            profile.link = parseProfileLink(userProfile);
            profile.picture = parseProfilePicture(userProfile);
            profile.language = parseProfileLanguage(userProfile);

            // facebook specific properties
            profile.birthday = userProfile.birthday;
            profile.first_name = userProfile.first_name;
            profile.last_name = userProfile.last_name;
            profile.email= userProfile.email;
            profile.gender= userProfile.gender;

            // twitter specific properties
            profile.screen_name = userProfile.screen_name;
            profile.registration_date = userProfile.created_at;
            profile.followers_count = userProfile.followers_count;
            profile.following_count = userProfile.friends_count;

            return profile;
        },

        normalizeFriend : function(provider, friendData){
            var friend = new Friend(provider);

            // common properties
            friend.name = friendData.name;
            friend.picture = parseFriendPicture(friendData);

            // twitter specific properties
            friend.id = friendData.id;
            friend.description = friendData.description;

            return friend;
        }

    };

};