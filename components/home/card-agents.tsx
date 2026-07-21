import { Avatar, AvatarGroup, Card, CardBody } from "@nextui-org/react";
import React from "react";

export const CardAgents = () => {
  return (
    <Card className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl shadow-lg shadow-cyan-500/5 px-4 py-6 w-full">
      <CardBody className="py-5 gap-6">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border border-cyan-500/20 bg-cyan-500/5 py-2.5 px-6 rounded-xl">
            <span className="text-white text-lg font-black tracking-wide">
              ⚔️ Squad Members
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-col">
          <span className="text-xs text-gray-500 font-medium text-center">
            Meet your agenda and see their ranks to get the best results
          </span>
          <AvatarGroup isBordered>
            <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
            <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
            <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
            <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
          </AvatarGroup>
        </div>
      </CardBody>
    </Card>
  );
};
