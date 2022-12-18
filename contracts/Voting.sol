pragma solidity 0.5.16;
contract Voting {
    // Model a item
    struct Item {
        uint id;
        string name;
        uint voteCount;
    }
    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write items
    mapping(uint => Item) public items;
    // Store items Count
    uint public itemsCount;
    uint public votesCount;

    constructor () public {
        votesCount = 0;
        itemsCount = 0;
        additem("Bitcoin");
        additem("Ethereum");
        additem("Dogecoin");
        additem("Polygon");
        additem("Tether");
    }
    function additem (string memory _name) private {
        itemsCount ++;
        items[itemsCount] = Item(itemsCount, _name, 0);
    }
    function vote (uint _itemId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);
        // require a valid item
        require(_itemId > 0 && _itemId <= itemsCount);
        // record that voter has voted
        voters[msg.sender] = true;
        // update item vote Count
        items[_itemId].voteCount ++;

        votesCount++;
    }
}