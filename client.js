const cached = new Set();

const validCafe = ({path, businessHours}) => !cached.has(path) && businessHours;

// Dear reader,
// feel free to make your own frontend!
async function query(latitude, longitude) {
    const response = await fetch(
        'https://dengencafe.appspot.com/',
        {
            method: 'POST',
            body: JSON.stringify({
                query: "query SearchIndex($after: String, $latitude: Float!, $longitude: Float!, $where: CafeWhereInput) {\n  newCafes(\n    first: 20\n    after: $after\n    where: $where\n    orderBy: {updatedAt: DESC}\n    region: {latitude: $latitude, longitude: $longitude}\n  ) {\n    pageInfo {\n      hasNextPage\n      startCursor\n      endCursor\n      __typename\n    }\n    totalCount\n    edges {\n      node {\n        ...CafePage_cafe\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CafePage_cafe on Cafe {\n  id\n  databaseId\n  path\n  access\n  address1\n  address2\n  branchName\n  brand {\n    id\n    name\n    __typename\n  }\n  businessHours\n  cafeToCafeTags {\n    cafeTag {\n      ...CafePage_cafeTag\n      __typename\n    }\n    __typename\n  }\n  cafeToSponsors {\n    sponsor {\n      ...CafePage_sponsor\n      __typename\n    }\n    __typename\n  }\n  cafeToUsages {\n    usage {\n      ...CafePage_usage\n      __typename\n    }\n    __typename\n  }\n  chargingMemo\n  chargingPermission\n  city\n  createdAt\n  description\n  holiday\n  pictures {\n    id\n    ...CafePage_attachment\n    __typename\n  }\n  latitude\n  longitude\n  meal {\n    id\n    ...CafePage_meal\n    __typename\n  }\n  memo\n  mobileBatteryMemo\n  mobileBatteryPermission\n  name\n  official\n  outletsCount\n  phone\n  postalcode\n  prefecture\n  recommendation\n  reviewComment\n  smoking\n  takeAwayAvailable\n  terraceSeatsAvailable\n  updatedAt\n  url\n  wifi\n  wifiMemo\n  __typename\n}\n\nfragment CafePage_cafeTag on CafeTag {\n  id\n  name\n  slug\n  __typename\n}\n\nfragment CafePage_sponsor on Sponsor {\n  id\n  name\n  __typename\n}\n\nfragment CafePage_usage on Usage {\n  id\n  name\n  __typename\n}\n\nfragment CafePage_attachment on Attachment {\n  id\n  filename\n  url\n  kind\n  createdAt\n  updatedAt\n  __typename\n}\n\nfragment CafePage_meal on Meal {\n  id\n  alcohol\n  dessert\n  dinner\n  lunch\n  morning\n  snack\n  __typename\n}",
                operationName: 'SearchIndex',
                variables: {where: {archived: false}, latitude, longitude}
            }),
            // these are necessary
            headers: {
                'content-type': 'application/json',
                'x-application': 'dengencafe',
            }
        }
    );
    if (response.status === 200) {
        const data = await response.json();

        return data.data.newCafes.edges.map(e => e.node).filter(validCafe).map(cafe => {
            cached.add(cafe.path);
            return cafe;
        });
    } else {
        return [];
    }
}
