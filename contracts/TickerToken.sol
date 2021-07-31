pragma solidity >=0.4.22 <0.9.0;

contract TickerToken {
    uint256 public totalSupply;

    string public name = "Ticker Token";

    string public symbol = "TICK";

    string public version = "1.0.0";

    string public standard = "EIP-20";

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
