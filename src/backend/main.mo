import OutCall "http-outcalls/outcall";

actor {
  type Metadata = {
    artist : Text;
    title : Text;
    listeners : Nat;
    raw : Text;
  };

  // Transform callback for HTTP requests
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Fetch and return radio metadata from external service
  public shared ({ caller }) func fetchRadioMetadata() : async Metadata {
    let url = "https://studio5.live/status-json.xsl";
    let response = await OutCall.httpGetRequest(url, [], transform);

    // Parsing is handled client-side for now
    {
      artist = "";
      title = "";
      listeners = 0;
      raw = response;
    };
  };
};
