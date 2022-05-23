//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract MemeForest is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter public NumOfAllMemes;
    Counters.Counter public NumOfAllMembers;

    struct MemeMembers {
        string Name;
        address MemeberAddress;
        uint MyId;
        uint MyMemes;
        uint MyDeletedMemes;
        string Datejoined;
    }

    mapping(uint => MemeMembers) private IdMembers;
    mapping(address => bool) private alreadyAMember;
    mapping(address => mapping(uint => bool )) private DidyouStar;

    struct MemeFiles {
        string NameLink;
        address Owner;
        uint fileId;
        string fileLink;
        bool starred;
        uint Stars;
        uint Likes;
        string DateOfCreation;
        string DescriptionLink;
    }

    mapping (uint => MemeFiles) private IdMemeFiles;
    mapping(uint => address) private StarredMemeFiles;

     uint public NumberOfUploads;



    function CreateMembers (string memory _name, string memory _date) public nonReentrant{
        require(alreadyAMember[msg.sender] == false, "You are already a member");

        NumOfAllMembers.increment();
        uint currentMemberId = NumOfAllMembers.current();

        IdMembers[currentMemberId] = MemeMembers (
            _name,
            msg.sender,
            currentMemberId,
            0,
            0,
            _date

        );

        alreadyAMember[msg.sender] = true;

    }


    function fetchMembers() public view returns(MemeMembers[] memory) {
        uint currentMemberNum = NumOfAllMembers.current();
        uint currentIndex = 0;
        MemeMembers[] memory members = new MemeMembers[] (currentMemberNum);
        for (uint256 index = 0; index < currentMemberNum; index++) {
            uint currenNum = IdMembers[index + 1].MyId;
            MemeMembers storage memeMem = IdMembers[currenNum];
            members[currentIndex] = memeMem;
            currentIndex+=1;
        }
        return members;
    }


    function GetMemberByAddr(address _member)external view returns(MemeMembers[] memory){
        uint currentMemberNum = NumOfAllMembers.current();
        uint currentIndex = 0;
        MemeMembers[] memory foundMember = new MemeMembers[] (1);
        for(uint i = 0; i< currentMemberNum; i++){
            if(_member == IdMembers[i+1].MemeberAddress ){
                uint currentmem = IdMembers[i+1].MyId;
                MemeMembers storage memMem = IdMembers[currentmem];
                foundMember[currentIndex] = memMem;
            }
        }
        return foundMember;

    }


    function IsAMember(address sender) external view returns(bool) {
        bool member = alreadyAMember[sender];
        return member;
    }

    function CreateMemeItems(string memory _nameLink, 
    address _owner, 
    string memory _fileLink,
    string memory _date, 
    string memory _descriptionLink) 
    public nonReentrant{
        NumOfAllMemes.increment();
        uint256 currentMeme =  NumOfAllMemes.current();
        IdMemeFiles[currentMeme] = MemeFiles(
            _nameLink,
            _owner,
            currentMeme,
            _fileLink,
            false,
            0,
            0,
            _date,
            _descriptionLink

        );
         uint currentMemberNum = NumOfAllMembers.current();
        for (uint i = 0; i < currentMemberNum; i++) {
            if(_owner == IdMembers[i+1].MemeberAddress){
                uint currentNum = IdMembers[i+1].MyId;
                IdMembers[currentNum].MyMemes +=1;
            }
        }

    }


    function fetchAllMemes() public view returns(MemeFiles[] memory) {

        uint currentMemeNum = NumOfAllMemes.current();
        uint currentIndex = 0;
        MemeFiles[] memory memes = new MemeFiles[] (currentMemeNum);

        for (uint256 index = currentMemeNum; index < 0; index--) {
            uint currenNum = IdMemeFiles[index].fileId;
            MemeFiles storage memeFiles = IdMemeFiles[currenNum];

            memes[currentIndex] = memeFiles;
            currentIndex+=1;

            
        }
        return memes;
    }

    function LikeMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
              
                IdMemeFiles[i+1].Likes+=1;
                
               
            }
        }

    }
    function UnLikeMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
              
                IdMemeFiles[i+1].Likes-=1;
                
               
            }
        }

    }
    function StarMeme(uint _id ) public {
        uint currentMemeNum = NumOfAllMemes.current();
        
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
                IdMemeFiles[_id].starred = true;
                IdMemeFiles[_id].Stars+=1;

                DidyouStar[msg.sender][_id]= true;
               
            }
        }

    }
    function RemoveStarMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
        
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
                IdMemeFiles[_id].starred = true;
                IdMemeFiles[_id].Stars-=1;

                DidyouStar[msg.sender][_id]= false;
               
            }
        }

    }


    function fetchMyStarredMemes() public view returns (MemeFiles[] memory) {
        uint currentMemeNum = NumOfAllMemes.current();
        uint currentIndex = 0;
        MemeFiles[] memory memes = new MemeFiles[] (currentMemeNum);
        for (uint i = 0; i < currentMemeNum; i++) {
            uint id = IdMemeFiles[i+1].fileId;
            address person = msg.sender;
            if(DidyouStar[person][id] == true && IdMemeFiles[i+1].starred== true ){
            MemeFiles storage memeFiles = IdMemeFiles[id];

            memes[currentIndex] = memeFiles;
            currentIndex+=1;
            }
        }
        return memes;
    }

    function fetchMyMeme() public view returns (MemeFiles[] memory) {
        address Sender = msg.sender;
        uint currentMemeNum = NumOfAllMemes.current();
        uint currentIndex = 0;
        MemeFiles[] memory memes = new MemeFiles[] (currentMemeNum);
         for (uint i = 0; i < currentMemeNum; i++) {
             uint id = IdMemeFiles[i+1].fileId;
             if( IdMemeFiles[id].Owner == Sender ){
                 
                  MemeFiles storage memeFiles = IdMemeFiles[id];

            memes[currentIndex] = memeFiles;
            currentIndex+=1;
             }
         }
         return memes;
    }

    // function getNumberOfUploads (address _member) external returns (uint)
    // {
    //     address Sender = _member;
    //     uint currentMemeNum = NumOfAllMemes.current();
    //         for (uint i = 0; i < currentMemeNum; i++) 
    //         {
    //             uint id = IdMemeFiles[i+1].fileId;
    //             if( IdMemeFiles[id].Owner == Sender )
    //             { 
    //                 NumberOfUploads+=1;
    //             }
    //         }
        
    //     return NumberOfUploads;
    // }
} 

