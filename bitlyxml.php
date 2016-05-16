<?php
if(strpos($_SERVER["HTTP_REFERER"],"findhills.com") or 
   strpos($_SERVER["HTTP_REFERER"],"cogni.us") or 
   strpos($_SERVER[HTTP_REFERER],"localhost:8890")) { 
    // Make sure script is being called by other file on server

    include_once('bitly.php');
    $xml = new SimpleXMLElement('<xml/>');

    if($_GET["url"]) {
    	$results = bitly_v3_shorten($_GET["url"], 'fdhl.co');
    } 
    else { 
        $results["url"] = "No URL provided"; 
    }

    $result = $xml->addChild('result');
    $result->addChild('shorturl',$results["url"]);
    $result->addChild('hash',$results["hash"]);
    $result->addChild('longurl',$results["long_url"]);

    print($xml->asXML());
} else {
    print("Cannot display");
}
?>