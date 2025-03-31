import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Types "./Types";
actor {


    stable var tickets : [Types.Ticket] = [];

    public shared func mint(owner : Principal, svg : Text) : async Text {
        let newTicket = {
            owner = owner;
            metadata = [("image", svg), ("status", "active")];
        };
        tickets := Array.append(tickets, [newTicket]);
        return "Ticket minted successfully!";
    };

    public shared func verify(qrHash : Text) : async Bool {
        let ticket = Array.find(
            tickets,
            func(t : Types.Ticket) : Bool {
                Array.find(
                    t.metadata,
                    func(pair : (Text, Text)) : Bool {
                        pair.0 == "qrHash" and pair.1 == qrHash
                    },
                ) != null;
            },
        );
        return ticket != null;
    };
};
