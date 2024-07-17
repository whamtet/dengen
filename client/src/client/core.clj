(ns client.core
    (:require
      [cheshire.core :refer [generate-string]]
      [clj-http.client :as client])
    (:import
      java.io.File))

(def query "query SearchIndex($after: String, $latitude: Float!, $longitude: Float!, $where: CafeWhereInput) {\n  newCafes(\n    first: 1000\n    after: $after\n    where: $where\n    orderBy: {updatedAt: DESC}\n    region: {latitude: $latitude, longitude: $longitude}\n  ) {\n    pageInfo {\n      hasNextPage\n      startCursor\n      endCursor\n      __typename\n    }\n    totalCount\n    edges {\n      node {\n        ...CafePage_cafe\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CafePage_cafe on Cafe {\n  id\n  databaseId\n  path\n  access\n  address1\n  address2\n  branchName\n  brand {\n    id\n    name\n    __typename\n  }\n  businessHours\n  cafeToCafeTags {\n    cafeTag {\n      ...CafePage_cafeTag\n      __typename\n    }\n    __typename\n  }\n  cafeToSponsors {\n    sponsor {\n      ...CafePage_sponsor\n      __typename\n    }\n    __typename\n  }\n  cafeToUsages {\n    usage {\n      ...CafePage_usage\n      __typename\n    }\n    __typename\n  }\n  chargingMemo\n  chargingPermission\n  city\n  createdAt\n  description\n  holiday\n  pictures {\n    id\n    ...CafePage_attachment\n    __typename\n  }\n  latitude\n  longitude\n  meal {\n    id\n    ...CafePage_meal\n    __typename\n  }\n  memo\n  mobileBatteryMemo\n  mobileBatteryPermission\n  name\n  official\n  outletsCount\n  phone\n  postalcode\n  prefecture\n  recommendation\n  reviewComment\n  smoking\n  takeAwayAvailable\n  terraceSeatsAvailable\n  updatedAt\n  url\n  wifi\n  wifiMemo\n  __typename\n}\n\nfragment CafePage_cafeTag on CafeTag {\n  id\n  name\n  slug\n  __typename\n}\n\nfragment CafePage_sponsor on Sponsor {\n  id\n  name\n  __typename\n}\n\nfragment CafePage_usage on Usage {\n  id\n  name\n  __typename\n}\n\nfragment CafePage_attachment on Attachment {\n  id\n  filename\n  url\n  kind\n  createdAt\n  updatedAt\n  __typename\n}\n\nfragment CafePage_meal on Meal {\n  id\n  alcohol\n  dessert\n  dinner\n  lunch\n  morning\n  snack\n  __typename\n}")

(defn- variables [after]
  (cond-> {:where {:archived false}
           :latitude 35.7645267
           :longitude 139.8322096}
          after (assoc :after after)))

(defn- post* [after]
  (client/post
    "https://dengencafe.appspot.com/"
   {:headers {"content-type" "application/json"
              "x-application" "dengencafe"}
    :form-params {:query query
                  :operationName "SearchIndex"
                  :variables (variables after)}
    :content-type :json
    :as :json}))

(defn- post [after]
  (get-in (post* after) [:body :data :newCafes]))

(defn- dump [after]
  (prn 'after after)
  (let [{:keys [pageInfo edges]} (post after)]
    (spit (format "dump/%s.edn" after) (pr-str edges))
    (when (:hasNextPage pageInfo)
          (-> pageInfo :endCursor recur))))

(defn- select-file [f]
  (when (-> f .getName (.endsWith ".edn"))
        (->> f
             slurp
             read-string
             (keep
              (fn [{{:keys [latitude longitude path businessHours wifi]} :node}]
                (when businessHours
                      [path [latitude longitude path businessHours (if (= "AVAILABLE" wifi) 1 0)]]))))))

(defn select []
  (->> "dump"
       File.
       .listFiles
       (mapcat select-file)
       ;; TODO - merge with latest data
       (into {})
       vals
       generate-string
       (spit "../public/locations.json")))
